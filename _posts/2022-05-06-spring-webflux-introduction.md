---
layout: post
title: "springwebflux 개요 알아보기"
date: 2022-05-06 0:1:28 +0900
categories: springwebflux
---
## 스프링 웹플럭스 특징

- netty를 사용하면 내부적으로 Project Reactor(Reactive Streams의 구현체)를 기반으로 동작. 기본적으로 Project Reactor를 사용하지만 RxJava 등 다른구현체 사용가능.

- Spring WebFlux는 Spring MVC와 달리 Servlet과는 전혀 관계없이 만들어졌으며, 그렇기 때문에 더이상 WAS가 필요하지 않다





## Spring mvc와 비교

![](https://d2.naver.com/content/images/2020/02/spring-mvc-and-webflux-venn.png)



### 공통점

- 컨트롤러 사용

- 논블로킹 리액티브 클라이언트 사용

ex) WebClient

- 기본 설정은 Netty(reactor-netty)를 기반으로 하지만 별도 설정을 통해 다른 Servlet 3.1 스펙(3.1이후로만가능)을 준수하는 WAS 엔진(Tomcat, Jetty 등)도 사용할 수는 있다

- Annotation-based 라우팅





### 차이점



1. Spring webflux의 Event loop - 논블로킹I/O Thread다



#### 서블릿

![](https://dz2cdn1.dzone.com/storage/temp/13213752-1586703123953.png)



#### 네티

- 이벤트루프모델

- 이벤트루프가 여러개면 이벤트루프그룹 으로관리

- 싱글스레드 사용으로 리소스 사용 최소



![](https://dz2cdn1.dzone.com/storage/temp/13213756-1586703381835.png)



- 높은 cpu 작업

- 디비 작업

- 파일읽기쓰기

- 네트워크작업



이유로 이벤트루프가 블락 가능하다. 이벤트루프를 추가해도 소켓에 바인딩된 이벤트루프를 대신 해서 다른이벤트루프가 동작하는 것은 안됨.

멀티 cpu에서는 멀티플 이벤트루가 동시에 동작가능. 기본적으로 어플리케이션은 cpu 코어수만큼 이벤트루프가 시작된다.





![](https://dz2cdn1.dzone.com/storage/temp/13213758-1586703532027.png)



Channel handler.. interface : 네티의 I/O 이벤트를 처리 하거나 작업을 가져와서 다음 처리기로 전달 하는 기능을 하는 인터페이스이며 실제로 비즈니스 로직에 의해 처리되는 부분



어플리케이션에서 다른 스레드에 리퀘스트를 위임하고 새로운 리퀘스트 핸들링을 위해 이벤트루프를 블록하지 않는 콜백을 통해 비동기로 결과를 받는다.



1. 소켓으로 요청받음

2. 소켓채널들의 범위안에 하나의 이벤트루프쓰레드가 있다. 모든 요청은 소켓과 소켓채널로 들어오고 하나의 이벤트루프안에서 핸들링된다.

3. 이벤트 루프 에서 인바운드 채널 또는 WebFilters가 설정되어 있는 채널 파이프라인을 통과한다.

4. 이벤트루프가 새로운 워커스레드에 리퀘스트를 위임한다

5. 워커스레드는 긴시간의 작업을 수행

6. 5 완료되면 task에 응답하고 ScheduledTaskQueue 에 task를 담는다.

7. 이벤트루프는 ScheduledTaskQueue 에 폴링

8. ScheduledTaskQueue 에 쌓여있으면 아웃바운드핸들러, 리퀘스트에 대한 응답을 수행한다.

9. ScheduledTaskQueue 에 쌓여있지 않으면 SocketChannel에 새로운 요청 폴링

- 동시성 모델



스프링 MVC(그리고 일반적인 서블릿 어플리케이션)에서는 어플리케이션은 현재 쓰레드가 블로킹될 것(예로, 원격 호출에 대하여). 그리고 이로 인하여 서블릿 컨테이너는 요청을 핸들링하는 동안 발생할 수 있는 잠재적인 블로킹에 대비하기 위해 큰 수의 쓰레드 풀을 사용하게 된다.



스프링 웹플럭스(그리고 일반적인 논 블로킹 서버에서)에서는 어플리케이션은 쓰레드를 블로킹 하지 않을 것을 상정한다. 따라서 논 블로킹 서버는 적고 고정된 크기의 쓰레드 풀을 사용하여 요청을 처리한다(이벤트 루프 워커).



2. 함수기반 라우팅



```java

// 기존의 애너테이션 기반 라우팅

@GetMapping("/hello")

@ResponseBody

public Mono<String> getHello() {



    return demoService.getHello();



}



// 함수 기반 라우팅

@Bean

public RouterFunction<ServerResponse> routes(DemoHandler demoHandler) {



    return RouterFunctions

        .route(RequestPredicates.GET("/hello"), demoHandler::getHello);



}

```





# Reactor Core

리액티브 프로그래밍 모델을 구현한 자바 8 라이브러리다.

-  http://www.reactive-streams.org/ 명세를 기반으로 만들어졌고 이 명세는 리액티브 어플리케이션을 만드는 표준이다.

- 논블로킹 backpressure 와 함께 비동기 스트림 처리를 위한 표준을 제공하는 Reactive Streams을 기반으로 만들어졌다.

- 리액티브 스트림즈는 Publisher를 이용해서 스트림을 정의하며 Subscriber를 이용해서 발생한 신호를 처리한다. Subscriber가 Publisher로부터 신호를 받는 것을 구독이라고 한다.



reactor-core 라이브러리가 필요하다.

```

<dependency>

    <groupId>io.projectreactor</groupId>

    <artifactId>reactor-core</artifactId>

    <version>3.3.9.RELEASE</version>

</dependency>

```



### 데이터의스트림 프로듀싱

리액티브 어플리케이션이 되기 위해서는 데이터스트림을 프로듀싱해야한다.

데이터 없이는 프로듀싱을 할 수 없다는 것이고 리액티브가 되지 않는다는 것.

그래서 Reactive Core는 두가지 데이터 타입을 제공한다.



#### flux mono

Flux 와 Mono 의 차이점은 발행하는 데이터 갯수이다.



Flux : 0 ~ N 개의 데이터 전달

Mono : 0 ~ 1 개의 데이터 전달



```java

// 0~ n개

Flux<Integer> just = Flux.just(1, 2, 3, 4); // just() Flux/Mono를 생성, create(), generate()

// 1개

Mono<Integer> just1 = Mono.just(1);

```



flux와 mono는 리액티브스트림의 reactivestreams의 Publisher 인터페이스 구현체다.



``Publisher<String> just = Mono.just("foo");`` 이렇게도 사용가능



### 스트림 subscribing





```java

List<Integer> elements = new ArrayList<>();



Flux<Integer> f = Flux.just(1, 2, 3, 4)

        .log()

        .doOnComplete(() -> System.out.println("dooncomplete"))

        .doOnNext(i -> System.out.println(i + "doonnext"));



f.subscribe(elements::add);



assertThat(elements).containsExactly(1, 2, 3, 4);

```



```

reactor.Flux.Array.1                   : onSubscribe([Synchronous Fuseable] FluxArray.ArraySubscription)

reactor.Flux.Array.1                     : | request(unbounded)

reactor.Flux.Array.1                     : | onNext(1)

1doonnext

reactor.Flux.Array.1                     : | onNext(2)

2doonnext

reactor.Flux.Array.1                     : | onNext(3)

3doonnext

reactor.Flux.Array.1                     : | onNext(4)

4doonnext

reactor.Flux.Array.1                     : | onComplete()

dooncomplete

```

onSubscribe() – This is called when we subscribe to our stream



request(unbounded) – When we call subscribe, behind the scenes we are creating a Subscription. This subscription requests elements from the stream. In this case, it defaults to unbounded, meaning it requests every single element available



onNext() – This is called on every single element

Publisher가 next 신호를 보내면 호출된다.



onComplete() – This is called last, after receiving the last element. There's actually a onError() as well, which would be called if there is an exception, but in this case, there isn't

스트림이 끝났을 때 발생. Publisher가 complete 신호를 보내면 호출된다.

### java 8 streams와 비교

큰 차이는 자바 8은 pull모델 리액티브는 Push모델이다.





자바 8 streams는 모든 데이터를 당겨오고 결과로 반환한다. 리액티브는 외부리소스로 부터 들어오며 mutiple subscribers가 추가,제거 가능하며 무한한 스트림을 가질 수 있다.



위의 과정은 combine streams, throttle streams, backpressure 와 같은 작업과 함께 사용 할 수 있다.



### backpressure

Backpressure is when a downstream can tell an upstream to send it fewer data in order to prevent it from being overwhelmed.





```java

Flux.just(1, 2, 3, 4)

  .log()

  .subscribe(new Subscriber<Integer>() {

    private Subscription s;

    int onNextAmount;



    @Override

    public void onSubscribe(Subscription s) {

        this.s = s;

        s.request(2);

    }



    @Override

    public void onNext(Integer integer) {

        elements.add(integer);

        onNextAmount++;

        if (onNextAmount % 2 == 0) {

            s.request(2); // subscription을 통해 publisher에 데이터를 2개 요청, request가 없다면 더이상 onNext가 호출안됨

        }

        //다운스트림에 비어있으면 업스트림에 요청

    }



    @Override

    public void onError(Throwable t) {}



    @Override

    public void onComplete() {}

});

```



```

23:31:15.395 [main] INFO  reactor.Flux.Array.1 - | onSubscribe([Synchronous Fuseable] FluxArray.ArraySubscription)

23:31:15.397 [main] INFO  reactor.Flux.Array.1 - | request(2)

23:31:15.397 [main] INFO  reactor.Flux.Array.1 - | onNext(1)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | onNext(2)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | request(2)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | onNext(3)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | onNext(4)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | request(2)

23:31:15.398 [main] INFO  reactor.Flux.Array.1 - | onComplete()

```



### combine streams



```java

Flux.just(1, 2, 3, 4)

  .log()

  .map(i -> i * 2)

  .zipWith(Flux.range(0, Integer.MAX_VALUE), // Flux 하나 생성

    (one, two) -> String.format("First Flux: %d, Second Flux: %d", one, two))

  .subscribe(elements::add);



assertThat(elements).containsExactly(

  "First Flux: 2, Second Flux: 0",

  "First Flux: 4, Second Flux: 1",

  "First Flux: 6, Second Flux: 2",

  "First Flux: 8, Second Flux: 3");

```



### hot streams

지금까지가 cold streams 라고하며 이것들은 스태틱이다. 고정길이의 스트림을 말한다.리액티브에서 더 현실적인 케이스는 무한인 것이다.

이런 타입을 hot streams이라고한다. 외부로부터 받아오는 무한한데이터 - 트위터피드



subscriber 수에 관계없이 데이터를 publishing

```java

ConnectableFlux<Object> publish = Flux.create(fluxSink -> {

            while(true) {

                fluxSink.next(System.currentTimeMillis());

            }

        })

        .publish();

publish.subscribe(System.out::println);

publish.subscribe(System.out::println);



//publish.connect();

```

subscribe 호출이 flux emitting 시작을 하지 않음

이는 여러 subscription을 추가하는것이 가능하게한다.

hot streams는 publish.connect(); 를 호출하기 전까지 Flux가 emitting을 시작하지 않는다.

구독자가 없어도 emit할수있다. 리액티브프로그래밍의 특징인 구독하기 전에는 아무것도 일어나지 않는다의 예외https://projectreactor.io/docs/core/snapshot/reference/#_from_imperative_to_reactive_programming

### cold streams

```java

Flux.just(1, 2, 3, 4)

```

https://projectreactor.io/docs/core/snapshot/reference/#reactive.hotCold

콜드는 subscriber 마다 flux를 새로생성한다.



### throttling

현재시간 출력 시 sample() method 로 2초의 간격을 만든다.

```java

ConnectableFlux<Object> publish = Flux.create(fluxSink -> {

    while(true) {

        fluxSink.next(System.currentTimeMillis());

    }

})

  .sample(ofSeconds(2))

  .publish();

```





## 동시성

Schedulers 인터페이스가 비동기 코드 추상화를 제공한다.

Subscription이 다른 스레드에서 동작한다.

```java

Flux.just(1, 2, 3, 4)

  .log()

  .map(i -> i * 2)

  .subscribeOn(Schedulers.parallel())

  .subscribe(elements::add);

```



```

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | request(unbounded)

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | onNext(1)

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | onNext(2)

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | onNext(3)

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | onNext(4)

20:03:27.531 <strong>[parallel-1]</strong> INFO  reactor.Flux.Array.1 - | onComplete()

```



- 참고



https://d2.naver.com/helloworld/6080222

https://dzone.com/articles/spring-webflux-eventloop-vs-thread-per-request-mod

https://www.baeldung.com/reactor-core
