import { Injectable } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import { Browser, Page } from "puppeteer";

@Injectable()
export class ScrapperService {
  constructor() {
  }

  async getData() {
    const baseURL = "https://www.supercasas.com/apartamentos";
    const recentPage = `${baseURL}?recentsPage`;
    const totalPage = await this.getDataForPage(baseURL, this.getCountPage);
    const listPage = this.convertTotalInArray(Number(totalPage));

    const sourceDate = listPage.map(async (pageNumber) => {
      const x = await this.getDataForPage(
        `${recentPage}/${pageNumber}`,
        this.exampleScrappingPage
      );
      console.log(x);
      return x;
    });

    return {
      data: listPage
    };
  }

  private async prepareBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true
    });
  }

  private async getPageInBrowser(browser: Browser): Promise<Page> {
    return await browser.newPage();
  }

  private exampleScrappingPage() {
    let sources = document.querySelector(".generic-results");
    let list = Array.from(sources.querySelectorAll("li.normal"));
    return list.map((element) => {
      let anchorURL = element.querySelector("a").href;
      let imageURL = element.querySelector("img").src;
      let type = element.querySelector(".title1").textContent;
      let sector = element.querySelector(".title2").textContent;
      let price = element.querySelector(".title3").textContent;
      return {
        anchorURL,
        imageURL,
        type,
        sector,
        price
      };
    });
  }

  private getCountPage(): any {
    let sources = document.querySelector(".homerow-5-recent-nav");
    let textPlain = sources.querySelector("span").textContent;
    let arrayText = textPlain.split("/");
    return arrayText[arrayText.length - 1];
  }

  private convertTotalInArray(total: number): Array<number> {
    const array = [];
    for (let i = 1; i <= total; i++) {
      array.push(i);
    }

    return array;
  }

  private async getDataForPage<T>(
    pageURL: string,
    callback: Function
  ): Promise<any> {
    const browser: Browser = await this.prepareBrowser();
    const page = await this.getPageInBrowser(browser);
    await page.goto(pageURL, {
      waitUntil: "networkidle2"
    });

    // @ts-ignore
    const results = await page.evaluate(callback);

    await browser.close();

    return results;
  }
}
