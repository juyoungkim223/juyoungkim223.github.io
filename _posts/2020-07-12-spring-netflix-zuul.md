---
layout: post
title: "서비스 게이트웨이 with Spring netfilx zuul"
date: 2020-07-12 19:13:28 +0900
categories: Spring Netflix Zuul
---
스프링 넷플릭스 주울을 이용해 서비스 게이트 웨이 msa 아키텍쳐에 적용해 보겠습니다.  
주울은 넷플릭스의 오픈 소스 서비스 게이트웨이를 구현한 것입니다. jvm 기반 라우터로 동작하며 서버사이드 로드밸런서입니다.
리버스 프록시서버로서 zuul이 작동하고 로드밸런서를 수행할 수 있습니다.  
[리버스 프록시](https://m.blog.naver.com/alice_k106/221190043948)의 개념을 설명한 블로그입니다.  
인증, 권한, 보안에 관한 횡단 관심사(cross concrens)을 마이크로 서비스에서 분리합니다.

서비스 클라이언트는 서비스 게이트웨이가 관리하는 하나의 url을 통해 통신합니다. 모든 요청을 서비스 게이트웨이로 보내는데 그렇다면 서비스 디스커버리가 관리하는 서비스 클라이언트로의 요청을 직접 보내지 않게 됩니다.

- 정적라우팅 : 모든 서비스가 단일 서비스게이트웨이 url을 요청한다

- 동적라우팅 : 유입되는 서비스 요청을 기반으로 알맞은 서비스 호출

- 인증과 권한부여 : 모든 서비스 호출이 서비스 게이트웨이로 라우팅되므로 인증의 최적장소

- 서비스 호출 시 측정 지표와 로그 정보 수집

## 서비스 구성
- build.gradle

```
compile group: 'org.springframework.cloud', name: 'spring-cloud-starter-netflix-zuul', version: '2.2.3.RELEASE'
```

주울서비스를 위한 애너테이션 설정
```java
@EnableZuulProxy
public class ConudyzuulApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConudyzuulApplication.class, args);
    }

}
```

- application.yml

```
spring:
  eureka:
    instance:
      preferIpAddress: true
    client:
      registerWithEureka: true
      fetchRegistry: true
      serviceUrl:
        defaultZone: http://localhost:8761/eureka/
management:
  endpoints:
    web:
      exposure:
        include: '*'

```

zuul을 서비스 디스커버리에 등록할 수 있는 설정정보입니다.
actuator의 기본노출 endpoint는 ``/health``와 ``/info``입니다. zuul에서 매핑되는 라우팅정보도 확인하기 위해 다른 엔드포인트도 추가해줬습니다.

zuul 서버를 실행해서 유레카 디스커버리 서버에 등록해줍니다.
![](../../../../static/img/20200714-springnetfilxzuul/eureka-registry.JPG)

actuator를 이용해 서비스 디스커버리를 이용한 자동라우팅되고 있는 서버목록을 보겠습니다.
![](../../../../static/img/20200714-springnetfilxzuul/route-list.JPG)  

서비스 디스커버리 서버를 이용해 서비스 클라이언트로부터의 zuul로의 요청을 알맞은 서비스 클라이언트로 매핑해야 합니다.

유레카에 등록한 서비스ID로 자동 라우팅을 하겠습니다.

``http://localhost:5555/conudy-lion/`` 요청 엔드포인트를 보겠습니다.
- http://localhost:5555 : zuul서버의 url
- conudy-lion 유레카 서버의 레지스트리에 등록된 어플리케이션 명의 url 엔드포인트

자동경로 라우팅이 성공한다면 ``conudy-lion`` 서버의 엔드포인트를 호출했을 때와 동일하게 api 결과값을 받을 수 있습니다.
zuul에 등록되지 않는 서비스 경로를 요청하면 404 에러가 발생합니다.  

zuul은 서비스 게이트웨어로서 유레카 서버로부터 서비스 디스커버리에 등록된 서비스 레지스트리를 리본을 이용해 캐시한 데이터를 사용해 동작합니다.
- 동작 아키텍쳐

![](../../../../static/img/20200714-springnetfilxzuul/architecture.JPG)



### 참고  
https://callistaenterprise.se/blogg/teknik/2015/04/10/building-microservices-with-spring-cloud-and-netflix-oss-part-1/
