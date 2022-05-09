---
layout: post
title: "spring cloud에 git repository 사용"
date: 2020-06-21 0:1:28 +0900
tags: spring cloud git
categories: springcloud git
---
* TOC
{:toc}
스프링 클라우드 서버가 설정파일을 관리하기 위한 파일의 레포지토리로
git 기반의 레포지토리를 이용하겠습니다.

스프링 클라우드 서버가 설정 정보를 업데이트, 클라이언트에게 제공하기 위해 저장소로 사용할 git에 repository를 만들어줍니다.
``yml``, ``properties``파일을 생성해줍니다.
파일의 명명규칙은 ``{application}-{profile}``의 형태로 작성합니다. 아래 그림에서는 application이 ``conudy-lion``이 되고 profile은 ``dev``입니다.

![](../../../static/img/20200620-springcloud/git.JPG)

<br/>
# spring cloud config server
``@EnableConfigServer`` 어노테이션을 설정해 다른어플리케이션과 컨피그 서버가 통신할 수 있게 선언합니다.
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigApplication.class, args);
    }

}
```

컨피그 서버가 어떤 repository를 관리해야하는지 알아야 합니다.
컨피그는 git기반의 비분산 저장소를 운영하는 역할을 합니다.
``spring.cloud.config.server.git.uri``에 저장소로 사용할 git 레포지토리를 적어줍니다.
깃에 two-factor 설정이 되어있다면 컨피그 서버에서 권한을 획득할 수 없습니다.
- application.yml

```
server:
  port: 8000
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/conudy/conudy-config
          username:
          pw:
```
<br/>

컨피그 서버를 실행하고 난 뒤 컨피그 클라이언트가 요청한다면 데이터는 json형태로 받을 수 있습니다.

![](../../../static/img/20200620-springcloud/configServer-postman by get.JPG)

# spring cloud config client
어떤 스프링 클라우드 컨피그 클라이언트(msa에서 스프링 클라우드 컨피그 서버를 사용할 서버)는 어플리케이션이 실행할 때 컨피그서버와 바인드(클라우드 컨피그 서버에서 정의한 ``spring.cloud.config.uri``)가 돼야합니다.
모든 클라우드 컨피그 클라이언트는 클라우드 컨피그 서버에 정의한 ``spring.cloud.config.uri``를 사용하려면 ``bootstrap.yml``을 생성하거나 환경변수를 설정하는 것이 필요합니다.

- bootstrap.yml

```
server:
  port: 8081
spring:
  profiles:
    active: dev
  application:
    name: conudy-lion
  cloud:
    config:
      uri: http://localhost:8000
```  
클라우드 컨피그 클라이언트 어플리케이션이 사용할 ``profiles``은 dev, 이름은 ``conudy-lion``, ``spring.cloud.config.uri``에 스프링 클라우드 컨피그 서버 uri를 설정했습니다.  
## spring cloud config client 실행
클라우드 컨피그 클라이언트를 실행하면 클라우드 컨피그 서버로부터 설정정보를 읽어옵니다.

![](../../../static/img/20200620-springcloud/springcloudconfig client startup.JPG)

<br/>

### 중앙 설정 저장소의 정보가 변경 될 때 어떻게 동적으로 갱신될까?
- 스프링부트의 설정파일 로딩 과정

스프링 부트 애플리케이션은 어플리케이션이 시작할 때 설정정보를 로딩합니다. 실행중에 자동으로 스프링 클라우드 컨피그 서버에서 읽어오지 않습니다.  
 하지만 스프링 부트 액츄에이터의 ``@RefreshScope``애노테이션을 사용하면 다시 설정정보를 읽어올 수 있습니다.  
설정정보를 사용하는 클래스 수준 어노테이션 ``@RefreshScope`` 을 설정해주면됩니다. 단, 설정정보들은 사용자 정의 설정정보만 다시 로드됩니다. spring data jpa 에서 사용되는 구성정보 설정정보는 다시 로드 되지 않습니다.

<br/>
- 스프링 클라우드 컨피그 클라이언트의 application.yml

```yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,refresh
```
actuator의 health,info,refresh 모두 web에 의해 접근가능하도록 설정했습니다.

``http://localhost:8080/actuator/refresh``로 post요청 시 스프링 클라우드 컨피그 서버로부터 설정값을 읽어옵니다.  
<br/>
### 한계
1. 스프링 클라우드 컨피그 서버에서 변경이 일어난 설정파일을 클라우드 애플리케이션에서 actuator를 이용해 refresh하면 클라우드 애플리케이션의 재기동이 일어납니다.
2. 재기동은 설정변경이 일어난 msa의 모든 어플리케이션에서 수행되야합니다.

<br/>
### spring cloud bus
문제를 해결하기 위해 rabbitmq를 사용하겠습니다.

rabbitmq를 spring cloud bus라는 푸시 기반의 메커니즘으로 스프링 클라우드 컨피그 서버를 도와 수행할 수 있는 미들웨어로 사용할 것입니다.  

#### rabbitmq실행
1. ``docker run -d --hostname rabbit --name rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3.8.0``

2. ``docker ps``로 실행중인 컨테이너 확인합니다.  

스프링 클라우드 컨피그 클라이언트 애플리케이션에서 spring cloud bus를 이용해 메세징 미들웨어를 사용하기 위해 gradle 설정을 추가해줍니다.
- build.gradle

```.gradle
    compile group: 'org.springframework.cloud', name: 'spring-cloud-starter-bus-amqp', version: '2.2.2.RELEASE'
```

스프링 클라우드 컨피그 서버의 설정으로 cloud-bus를 변경 시 푸시해줄 수 있는 설정을 하겠습니다.
- application.yml

```yml
rabbitmq:
  host: localhost
  port: 5672
  username: guest
  password: guest
management:
  endpoints:
    web:
      exposure:
        include: bus-refresh
```
스프링 클라우드 컨피그 서버의 의존성관리는 maven을 사용하고 있기 때문에 pom.xml에 의존성라이브러리를 추가합니다.
- pom.xml

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-monitor</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```
스프링 클라우드 컨피그 서버에 요청합니다. postman을 이용해서 요청한다면 body의 데이터 형식을 raw로 요청해야합니다.
``http://localhost:8000/actuator/bus-refresh``

- cloud config server log

```
2020-06-20 23:50:57.245  INFO 14512 --- [nio-8000-exec-5] o.s.a.r.c.CachingConnectionFactory       : Attempting to connect to: [localhost:5672]
2020-06-20 23:50:57.264  INFO 14512 --- [nio-8000-exec-5] o.s.a.r.c.CachingConnectionFactory       : Created new connection: rabbitConnectionFactory.publisher#772f9906:0/SimpleConnection@767c03ef [delegate=amqp://guest@127.0.0.1:5672/, localPort= 11832]
2020-06-20 23:50:57.266  INFO 14512 --- [nio-8000-exec-5] o.s.amqp.rabbit.core.RabbitAdmin         : Auto-declaring a non-durable, auto-delete, or exclusive Queue (springCloudBus.anonymous.jEpdabhWReSn9wXphK_P4g) durable:false, auto-delete:true, exclusive:true. It will be redeclared if the broker stops and is restarted while the connection factory is alive, but all messages will be lost.
2020-06-20 23:50:57.284  INFO 14512 --- [nio-8000-exec-5] o.s.cloud.bus.event.RefreshListener      : Received remote refresh request.
2020-06-20 23:51:00.089  INFO 14512 --- [nio-8000-exec-5] o.s.boot.SpringApplication               : No active profile set, falling back to default profiles: default
2020-06-20 23:51:00.094  INFO 14512 --- [nio-8000-exec-5] o.s.boot.SpringApplication               : Started application in 2.8 seconds (JVM running for 115.417)
2020-06-20 23:51:02.769  INFO 14512 --- [nio-8000-exec-7] o.s.c.c.s.e.NativeEnvironmentRepository  : Adding property source: file:/../AppData/Local/Temp/config-repo-8766597393758749299/conudy-lion-dev.yml
2020-06-20 23:51:02.770  INFO 14512 --- [nio-8000-exec-5] o.s.cloud.bus.event.RefreshListener      : Keys refreshed []

```

- cloud config client log

```
2020-06-20 23:50:57.315  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.cloud.bus.event.RefreshListener      : Received remote refresh request.
2020-06-20 23:50:58.716  INFO 21912 --- [q2yuBcnhtL7jA-1] .e.DevToolsPropertyDefaultsPostProcessor : Devtools property defaults active! Set 'spring.devtools.add-properties' to 'false' to disable
2020-06-20 23:51:00.069  INFO 21912 --- [q2yuBcnhtL7jA-1] .e.DevToolsPropertyDefaultsPostProcessor : Devtools property defaults active! Set 'spring.devtools.add-properties' to 'false' to disable
2020-06-20 23:51:00.084  INFO 21912 --- [q2yuBcnhtL7jA-1] c.c.c.ConfigServicePropertySourceLocator : Fetching config from server at : http://localhost:8000
2020-06-20 23:51:02.779  INFO 21912 --- [q2yuBcnhtL7jA-1] c.c.c.ConfigServicePropertySourceLocator : Located environment: name=conudy-lion, profiles=[dev], label=null, version=bcc2fdd49d18e45979d01cbc5c34390ae3923c13, state=null
2020-06-20 23:51:02.779  INFO 21912 --- [q2yuBcnhtL7jA-1] b.c.PropertySourceBootstrapConfiguration : Located property source: [BootstrapPropertySource {name='bootstrapProperties-configClient'}, BootstrapPropertySource {name='bootstrapProperties-https://github.com/conudy/conudy-config/conudy-lion-dev.yml'}]
2020-06-20 23:51:02.781  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.boot.SpringApplication               : The following profiles are active: dev
2020-06-20 23:51:02.784  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.boot.SpringApplication               : Started application in 5.466 seconds (JVM running for 5868.172)
2020-06-20 23:51:03.046  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.cloud.bus.event.RefreshListener      : Keys refreshed [config.client.version, jy.first]
2020-06-20 23:51:03.061  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.a.r.c.CachingConnectionFactory       : Attempting to connect to: [localhost:5672]
2020-06-20 23:51:03.069  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.a.r.c.CachingConnectionFactory       : Created new connection: rabbitConnectionFactory.publisher#6b53d245:0/SimpleConnection@61ed89b7 [delegate=amqp://guest@127.0.0.1:5672/, localPort= 11837]
2020-06-20 23:51:03.071  INFO 21912 --- [q2yuBcnhtL7jA-1] o.s.amqp.rabbit.core.RabbitAdmin         : Auto-declaring a non-durable, auto-delete, or exclusive Queue (springCloudBus.anonymous.dxynhiFXRq2yuBcnhtL7jA) durable:false, auto-delete:true, exclusive:true. It will be redeclared if the broker stops and is restarted while the connection factory is alive, but all messages will be lost.
```

마이크로서비스는 변경된 설정정보를 어플리케이션과 분리할 수 있고 런타임에 주입해 컨피그 클라이언트는 자동 재시작 후 클라우드 컨피그 서버와 연결된 서비스들은 중앙서버로부터 설정정보를 자동으로 업데이트받을 수 있게 되었습니다.


# 참고
<https://cloud.spring.io/spring-cloud-config/reference/html/>
