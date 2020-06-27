---
layout: post
title: "서비스 디스커버리 with Spring Netflix's Eureka"
date: 2020-06-27 19:13:28 +0900
categories: Spring Netflix Eureka
---

유레카와 리본을 사용해 다음과 같은 기능을 구현해보겠습니다.  
1. Eureka 서버의 서비스 디스커버리
2. Eureka 클라이언트의 서비스 등록
3. Ribbon을 이용한 클라이언트 사이드 로드밸런싱
4. Feign 클라이언트로 RESTFul Service 호출

서비스 디스커버리 에이전트에 서비스를 등록하고 디스커버리를 구현하겠습니다.  
유레카를 사용하면 유레카 클라이언트는 서비스 디스커버리로부터 요청할 서비스 인스턴스의 ip주소를 알아야합니다.  
이 과정에서 리본을 사용하는데요. 리본의 역할을 알아보겠습니다.   
먼저 리본을 사용 유무에 따라 동작이 어떻게 다른지 보겠습니다.  

## 리본(client side load balancer)을 사용하지 않는 경우

![](../../../../static/img/20200625-springnetfilxeureka/servicediscovery-agent-diagram.JPG)

- 위 그림으로 본 서비스 디스커버리 계층과 서비스 인스턴스의 상호작용

1. 서비스 디스커버리 에이젼트에서 서비스의 위치를 찾습니다.
2. 서비스 디스커버리 에이젼트에 서비스의 IP주소를 등록합니다.
3. 서비스 디스커버리의 노드들은 상태(서비스 디스커버리 노드가 살아 있는지 죽어있는지)를 공유합니다.
4. 서비스는 서비스 디스커비리 에이젼트에 서비스의 상태(heartbeat)를 보냅니다. 서비스가 죽었다면 디스커버리 에이젼트의 노드에서 죽은 서비스 인스턴스의 IP를 제거합니다.

> 클라이언트(컨텐츠 요청자)의 요청이 들어올 때 마다 서비스 디스커버리 계층을 호출한 뒤 ip주소를 얻어 서비스를 호출 할 수 있습니다.

## 리본(client side load balancer)이 필요한 이유
클라이언트(컨텐츠 요청자)의 요청이 들어오면 서비스 디스커버리를 로컬기기에 캐시합니다.  
캐시로 클라이언트(컨텐츠 요청자)의 요청마다 서비스 디스커버리를 찾을 필요가 없어집니다.
그 다음 부하분산 알고리즘으로 서비스 호출을 클라이언트 사이드 로드밸런싱하여 실제 서비스 인스턴스로 분산합니다.
클라이언트 어플리케이션은 주기적으로 서비스 디스커버리에 접속해 캐시를 새로고침합니다.
![](../../../../static/img/20200625-springnetfilxeureka/servicediscovery-with-clientloadblance.JPG)

### 넷플릭스의 리본은 spring cloud eureka에서 따로 설정이 필요하지 않다
spring cloud eureka에는 넷플릭스 리본 라이브러리가 내장되어 있어 유레카 클라이언트 서비스를 호출할 때 리본이 다른 클라이언트의 ip 주소를 로컬에 캐싱해두고 클라이언트 사이드 로드밸런싱을 해주며 캐싱된 ip 주소를 디스커버리 레지스트리로부터 업데이트 합니다.


## 유레카 서버

- application.yml

```yml
server:
  port: 8761
eurekasrv:
  hostname: localhost
eureka:
  client:
    register-with-eureka: false # 기본적으로, 레지스트리에 등록하지 않도록설정합니다.
    fetch-registry: false
    service-url:
      defaultZone: http://${eurekasrv.hostname}:${server.port} # 기본설정을 하지 않은 유레카 클라이언트에 대해 유레카 서버 url을 제공합니다.
```

유레카 서버의 설정인데 ``eureka.client``의 설정도 필요한 이유는 유레카는 서버와 클라이언트 둘 다 될 수 있습니다. 따라서 유레카 서버로 사용하기 위해서는 레지스트리에 유레카 서버를 등록하면 안되기 때문에 설정이 필요합니다.

```java
@SpringBootApplication
@EnableEurekaServer
public class Application {

    public static void main(String[] args) {
        new SpringApplicationBuilder(Application.class).web(true).run(args);
    }
}
```

## 유레카 클라이언트

- application.yml

```yml
spring:
  application:
    name: conudy-giraffe
  eureka:
    client:
      serviceUrl:
        defaultZone: http://localhost:8761/eureka/
```

스프링 유레카 클라이언트 의존성 추가
- build.gradle

```
compile group: 'org.springframework.cloud', name: 'spring-cloud-starter-netflix-eureka-client', version: '2.2.3.RELEASE'
```

유레카 클라이언트는 설정파일과 의존성관리 2가지만 추가하는 방식으로 많은 msa서비스를 유레카 서버의 디스커버리 레지스트리에 추가해 관리할 수 있습니다.

## 유레카 서버& 유레카 클라이언트의 상태변화

- 유레카 서버의 로그

```
2020-06-25 18:50:11.281  INFO 26428 --- [nio-8761-exec-3] c.n.e.registry.AbstractInstanceRegistry  : Registered instance CONUDY-GIRAFFE/host.docker.internal:conudy-giraffe:8080 with status UP (replication=false)
2020-06-25 18:50:11.790  INFO 26428 --- [nio-8761-exec-4] c.n.e.registry.AbstractInstanceRegistry  : Registered instance CONUDY-GIRAFFE/host.docker.internal:conudy-giraffe:8080 with status UP (replication=true)
2020-06-25 18:50:30.029  INFO 26428 --- [hresholdUpdater] c.n.e.r.PeerAwareInstanceRegistryImpl    : Current renewal threshold is : 3
2020-06-25 18:50:30.155  INFO 26428 --- [a-EvictionTimer] c.n.e.registry.AbstractInstanceRegistry  : Running the evict task with compensationTime 0ms
2020-06-25 18:51:30.155  INFO 26428 --- [a-EvictionTimer] c.n.e.registry.AbstractInstanceRegistry  : Running the evict task with compensationTime 0ms
...생략
```
유레카 클라이언트를 실행하면 유레카 서버 레지스트리에 유레카 클라이언트가 등록됩니다.  

유레카 클라이언트가 등록되고 유레카 클라이언트의 Instance Info의 status는 초기 STARTING에서 UP으로 바뀝니다.  
유레카 서버에 접속해보면 레지스트리에 등록된 유레카 클라이언트의 상태를 확인할 수 있습니다.
![](../../../../static/img/20200625-springnetfilxeureka/eureka-server-status.JPG)

다른 방법으로는 유레카 클라이언트(현재 8080포트로 실행 중) ``http://localhost:8080/actuator/health``,  ``http://localhost:8080/actuator/info`` actuator를 이용해 유레카서버의 레지스트리에 등록된 클라이언트의 health와 info를 확인할 수 있습니다.

- 유레카 클라이언트의 로그

```
2020-06-25 20:11:02.927  INFO 17592 --- [trap-executor-0] c.n.d.s.r.aws.ConfigClusterResolver      : Resolving eureka endpoints via configuration
2020-06-25 20:16:02.908  INFO 17592 --- [trap-executor-0] c.n.d.s.r.aws.ConfigClusterResolver      : Resolving eureka endpoints via configuration
```

위 로그는 spring cloud eureka의 기반 기술인 ``com.netflix`` 패키지의 기능으로 로그레벨을 아래처럼 INFO -> WARN 으로 변경해 관리할 수 있습니다.

- application.yml

```
logging:
  level:
    com.netflix.discovery.shared.resolver.aws.ConfigClusterResolver: WARN
```
<br/>
### 서비스 인스턴스 연결 완료

![](../../../../static/img/20200625-springnetfilxeureka/eureka-registered-client-server-list.JPG)
저는 유레카 서버에 3개의 서비스인스턴스를 디스커버리 레이어와 연결했습니다.  
<br/>

## REST client : Feign
서비스 인스턴스 연결이 완료되었으니 넷플릭스의 Feign 클라이언트를 이용해 다른 마이크로서비스를 호출(RESTful service)해보겠습니다.  
Feign을 사용하려면 인터페이스를 생성하고 이를 어노테이션하면 됩니다.

### Feign의 동작 시점
![](../../../../static/img/20200625-springnetfilxeureka/feign-workflow.JPG)

### Feign의 장점
저는 기존 어플리케이션 개발에서는 다른 URL의 서비스를 호출할 때 RestTemplate을 이용해서 호출했었습니다.
이번에 Feign을 사용하며 Feign의 장점을 나열해보겠습니다.
1. REST 호출 시 유레카에 등록된 Eureka Client ID를 사용합니다. 그러면 호출하는 클라이언트입장에서는 호출하려는 서버의 IP주소를 몰라도 됩니다.
2. 1번 특성으로 URL이 하드코딩되지 않는다.
3. Ribbon & Eureka를 자동으로 통합시켜줍니다.
4. REST 서비스를 호출하는 코드를 작성할 필요가 없습니다.

### Feign 클라이언트
- build.gradle

```
compile group: 'org.springframework.cloud', name: 'spring-cloud-starter-openfeign', version: '2.2.3.RELEASE'
```
- cofiguration class

```java
...생략
@EnableFeignClients(basePackages = "jy.kim.client")
@Configuration
public class ClientConfig {

}

```
- ConudyGiraffeClient.java

```java
@FeignClient("conudy-giraffe")
public interface ConudyGiraffeClient {
    @RequestMapping(method = RequestMethod.GET,  value = "/member/{username}", consumes = "application/json")
    Member getMemberByUsername(@PathVariable("username") String username);
}
```

- controller.java

Autowired로 호출하면 REST 요청에 대한 코드는 Feign이 처리하게 됩니다.
```java
  @Autowired
   ConudyGiraffeClient conudyGiraffeClient;

   @GetMapping("/")
   public String mainPage() {
       System.out.println(conudyGiraffeClient.getMemberByUsername("user0").toString());
       return "main";
   }
```

- Feign을 이용한 RESTFul request의 로그

```
2020-06-27 11:07:49.188  INFO 20508 --- [nio-8081-exec-1] c.netflix.config.ChainedDynamicProperty  : Flipping property: conudy-giraffe.ribbon.ActiveConnectionsLimit to use NEXT property: niws.loadbalancer.availabilityFilteringRule.activeConnectionsLimit = 2147483647
2020-06-27 11:07:49.218  INFO 20508 --- [nio-8081-exec-1] c.n.u.concurrent.ShutdownEnabledTimer    : Shutdown hook installed for: NFLoadBalancer-PingTimer-conudy-giraffe
2020-06-27 11:07:49.218  INFO 20508 --- [nio-8081-exec-1] c.netflix.loadbalancer.BaseLoadBalancer  : Client: conudy-giraffe instantiated a LoadBalancer: DynamicServerListLoadBalancer:{NFLoadBalancer:name=conudy-giraffe,current list of Servers=[],Load balancer stats=Zone stats: {},Server stats: []}ServerList:null
2020-06-27 11:07:49.226  INFO 20508 --- [nio-8081-exec-1] c.n.l.DynamicServerListLoadBalancer      : Using serverListUpdater PollingServerListUpdater
2020-06-27 11:07:49.253  INFO 20508 --- [nio-8081-exec-1] c.netflix.config.ChainedDynamicProperty  : Flipping property: conudy-giraffe.ribbon.ActiveConnectionsLimit to use NEXT property: niws.loadbalancer.availabilityFilteringRule.activeConnectionsLimit = 2147483647
2020-06-27 11:07:49.255  INFO 20508 --- [nio-8081-exec-1] c.n.l.DynamicServerListLoadBalancer      : DynamicServerListLoadBalancer for client conudy-giraffe initialized: DynamicServerListLoadBalancer:{NFLoadBalancer:name=conudy-giraffe,current list of Servers=[host.docker.internal:8080],Load balancer stats=Zone stats: {defaultzone=[Zone:defaultzone;	Instance count:1;	Active connections count: 0;	Circuit breaker tripped count: 0;	Active connections per server: 0.0;]
},Server stats: [[Server:host.docker.internal:8080;	Zone:defaultZone;	Total Requests:0;	Successive connection failure:0;	Total blackout seconds:0;	Last connection made:Thu Jan 01 09:00:00 KST 1970;	First connection made: Thu Jan 01 09:00:00 KST 1970;	Active Connections:0;	total failure count in last (1000) msecs:0;	average resp time:0.0;	90 percentile resp time:0.0;	95 percentile resp time:0.0;	min resp time:0.0;	max resp time:0.0;	stddev resp time:0.0]
]}ServerList:org.springframework.cloud.netflix.ribbon.eureka.DomainExtractingServerList@404b2af4
2020-06-27 11:07:50.239  INFO 20508 --- [erListUpdater-0] c.netflix.config.ChainedDynamicProperty  : Flipping property: conudy-giraffe.ribbon.ActiveConnectionsLimit to use NEXT property: niws.loadbalancer.availabilityFilteringRule.activeConnectionsLimit = 2147483647

```
1. 처음 요청한다면 서비스디스커버리에서 서비스 인스턴스ip에 대한 캐시를 하기위해 Ribbon이 로컬캐시합니다.
2. Feign 클라이언트는 서비스ID를 기반으로 서비스IP를 찾아 RESTful Service를 수행합니다.  

처음에 캐시 한 뒤 이후의 요청이 온다면 리본은 로컬 캐시 된 서비스 인스턴스IP를 가지고 요청을 로드밸런싱하기 때문에 위 로그는 나오지 않습니다.


### 참고  

https://livebook.manning.com/book/spring-microservices-in-action/chapter-4/16  
https://cloud.spring.io/spring-cloud-netflix/multi/multi__service_discovery_eureka_clients  
https://cloud.spring.io/spring-cloud-netflix/multi/multi_spring-cloud-feign.html  
https://www.yamicode.com/snippets/client-side-load-balancer-ribbon-with-feign-and-spring-cloud-for-microservices
