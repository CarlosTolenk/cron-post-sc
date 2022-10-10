run-rabbitMQ:
	docker run -d --hostname demo-rabbit -p 5672:5672 -p 15672:15672 --name demo-rabbit rabbitmq:3-management
