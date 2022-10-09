import { Inject, Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import { ClientProxy } from '@nestjs/microservices';
import { POST_RAW } from './services.rabbit';

const BASE_URL = 'https://www.supercasas.com';
const SEARCH_URL = `${BASE_URL}/buscar?PagingPageSkip`;
const POST_PER_PAGE = 23;

interface PostRaw {
  id: string;
  anchorURL: string;
  imageURL: string;
  type: string;
  sector: string;
  price: string;
}

@Injectable()
export class ScrapperService {
  constructor(@Inject(POST_RAW.name) private client: ClientProxy) {}

  async getData() {
    const url = `${SEARCH_URL}=0`;

    const totalPost = await this.getDataForPage<any>(url, this.getTotalPost);
    const listPage = this.convertTotalInArray(totalPost);
    this.requestForScraping(SEARCH_URL, listPage);

    return {
      total: listPage.length,
    };
  }

  private async prepareBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true,
    });
  }

  private async getPageInBrowser(browser: Browser): Promise<Page> {
    return await browser.newPage();
  }

  private async requestForScraping(
    searchURL: string,
    listPage: Array<number>,
  ): Promise<void> {
    for (const pageNumber of listPage) {
      const url = `${searchURL}=${pageNumber}`;
      const data: PostRaw[] = await this.getDataForPage<PostRaw[]>(
        `${url}`,
        this.exampleScrappingPage,
      );

      this.publishEvents(data, url);
    }
  }

  private publishEvents(sourcePost: PostRaw[], urlSource: string): void {
    for (const post of sourcePost) {
      this.publishEvent(post, urlSource);
    }
  }

  private publishEvent(data: PostRaw, urlSource: string): void {
    this.client.emit(POST_RAW.queue, { ...data, urlSource });
  }

  private exampleScrappingPage() {
    try {
      let sources = document.querySelector(
        '#bigsearch-results-inner-container',
      );
      let list = Array.from(sources.querySelectorAll('li.normal'));
      const data: PostRaw[] = list.map((element) => {
        let anchorURL = element.querySelector('a').href;
        let imageURL = element.querySelector('img').src;
        let type = element.querySelector('.type').textContent;
        let sector = element.querySelector('.title1').textContent;
        let price = element.querySelector('.title2').textContent;
        let anchorURLArray = anchorURL.split('/');
        let id = anchorURLArray[anchorURLArray.length - 2];
        return {
          id,
          anchorURL,
          imageURL,
          type,
          sector,
          price,
        };
      });
      return data.filter(({ id }) => !!id);
    } catch (error) {
      return [];
    }
  }

  private getTotalPost(): any {
    let sources = document.querySelector(
      '#bigsearch-results-inner-topbar-counter',
    );
    let textPlain = sources.querySelector('#UpperCounter2').textContent;
    let totalPostPlain = textPlain.split('+')[0].replace(',', '');
    return Number(totalPostPlain);
  }

  private convertTotalInArray(totalPost: number): Array<number> {
    const totalPage = Math.floor(totalPost / POST_PER_PAGE);
    const array = [];
    for (let i = 0; i <= totalPage; i++) {
      array.push(i);
    }

    return array;
  }

  private async getDataForPage<T>(
    pageURL: string,
    callback: Function,
  ): Promise<any> {
    const browser: Browser = await this.prepareBrowser();
    const page = await this.getPageInBrowser(browser);
    await page.goto(pageURL, {
      waitUntil: 'networkidle2',
    });

    // @ts-ignore
    const results = await page.evaluate(callback);

    await browser.close();

    return results;
  }
}
