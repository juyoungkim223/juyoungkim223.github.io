---
layout: post
title: "스프링부트 커스텀 error페이지"
date: 2020-05-30 01:14:28 -0400
categories: springboot error
---
## 스프링부트 커스텀 error페이지

커스텀 404 페이지를 제공하기 위한 설정을 하겠습니다.  
기본적으로 ``org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration`` 자동설정으로 사용자가 지정한 서블릿 자원 기준(classpath)에서 ``/error`` 경로에 ``404.html``나 ``500.html`` 을 생성해두면 ``ErrorMvcAutoConfiguration``에 의해서 페이지 리다이렉션이 일어납니다.  
ex)
저의 경우 템플릿엔진을 사용해 ``.html``파일을 ``classpath:/templates/``에서 페이지를 컴파일해 html로 로딩하도록 설정해두었기 때문에
 다음과 같은 경로로``/src/main/resources/templates/error`` 설정한다면 스프링부트의 에러페이지가 나옵니다.

커스텀할 것은 ``/error``경로를 바꾸고 정해진 파일명(``404.html``)이 아닌 ``custom404.html`` 등으로 수정해서 동작하도록 구현 클래스를 생성하겠습니다.  

### 1.
 ``Whitelabel Error Page``라는 기본제공되는 스프링부트의 에러페이지를 사용하지 않는 설정으로 사용하지 않을 기능이라 unabled로 바꿨습니다. ``Whitelabel Error Page``을 사용하지 않으면 구동하는 WAS의 에러 페이지가 나옵니다.  

### 2.
 error처리의 경로를 기본경로가 아닌 ``/errorPage/``로 변경했습니다.

- application.yml


```yml
server:
  error:
    whitelabel:
      enabled: false
    path: /errorPage
```

- ErrorController 인터페이스를 구현한 BasicErrorController  

``server.error.path``경로를 설정파일로부터 읽어 자동설정하는것을 확인할 수 있습니다.  
```java
@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class BasicErrorController extends AbstractErrorController {

	private final ErrorProperties errorProperties;
```  

### 3.  
마지막으로 ErrorController 인터페이스를 구현하면 됩니다.
아래 코드를 작성하지 말고 위의 yml 설정과 같이 ``server.error.path``만 바꿔주고 Controller 클래스에서 에러매핑을 하면 됩니다.


```java
@Controller
public class CustomErrorController implements ErrorController {
    @RequestMapping("/errorPage")
    public ModelAndView handleError(HttpServletRequest request, HttpServletResponse response) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        ModelAndView modelAndView = new ModelAndView();
        System.out.println(response.getStatus());
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                modelAndView.setViewName("/errorPage/404");
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                modelAndView.setViewName("/errorPage/500");
            } else if (statusCode == HttpStatus.FORBIDDEN.value()) {
                modelAndView.setViewName("/errorPage/403");
            } else modelAndView.setViewName("/errorPage/common");
        }
        return modelAndView;
    }

    @Override
    public String getErrorPath() {
        return null;
    }
}
```

### depecated 된 코드
ErrorController의 ``getErrorPath()``는 스프링부트 2.3.0에서 deprecated되었으니 아래와 같이 자동설정을 비활성화하고 인터페이스메서드를 구현해도 작동하지 않습니다.
![](../../../static/img/20200530-ErrorController/getErrorPath.JPG)
```yml
spring:
  autoconfigure:
    exclude: org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration
```
```java
@Override
public String getErrorPath() {
    return "/errorPage"
}
```
