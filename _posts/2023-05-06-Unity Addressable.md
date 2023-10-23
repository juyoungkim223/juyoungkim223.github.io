---
layout: post
title: "Unity Addressable 사용하기"
date: 2023-05-06 14:30:28 +0900
tags: unity adressable
categories: unity
---
* TOC
{:toc}
Unity Addressable 사용하기.

## 어드레서블의 필요성.
### 1. Inspector에서 사용하지 않는 애셋까지 참조하고 있는 경우
하나의 Scene에서 여러개의 Prefab 중 하나의 Prefab만 필요한데도 여러개의 Prefab을 Inspector에서 참조하는 방식은 강한참조 방식이다. Scene이 Load될 때 참조하고 있는 모든 애셋을 메모리에 올리게 되어 Scene의 로딩 속도가 느려진다.
 
### 2. Scene 로딩 속도 저하를 해결하기 위해 Resource 폴더 하위에 사용하고 있는 Prefab을 옮겨놓은 경우
1의 문제점은 Scene Load시에 메모리에 사용하지 않는 Prefab까지 Load되어 시간이 오래걸렸다.
2번 방식을 사용하면 어플리케이션 초기 Load 시에 메모리에 Load되고 Scene 로딩속도는 빠르다.
2의 문제점은 강한참조와 마찬가지로 모든 애셋을 메모리에 로딩하는 점, 어플리케이션 초기 로딩시간의 지연, 사용하지 않는 메모리가 항상 로딩 그리고 빌드 사이즈 증가다.

 

1, 2 방식을 개선하기 위한 방법으로 어드레서블을 사용할 수 있다. 로컬 애셋, 리모트 애셋 둘 다 컨텐츠 관리가 가능하다.


## 어드레서블 이란?
애셋들을 주소로 참조하고 관리하기 위한 유니티 기능. 
어드레서블이란 주소를 통해서 어떤 애셋번들에 있는지 찾아서 로드할 수 있다.
![Alt text](../../../../static/img/230506-unity-addr/image.png)

특정 Scene에서 사용하는 Prefab들을 Addresable 애셋으로 등록했다.
Level Grid Local Group으로 이름지었다.

 

## 어드레서블과 애셋번들의 관계

에셋번들 패키지를 관리하는 것이 어드레서블

어드레서블 빌드

- 어드레서블 빌드 방법: 어드레서블 애셋 컨텐츠를 빌드한다. 애셋들을 애셋번들로 패키징하는 것이 목적이다.
![Alt text](../../../../static/img/230506-unity-addr/image-1.png)

- Play Mode Script: 실제 사용하기 위한 테스트를 위해서는 Play Mode Script에서 Use Exsiting Mode로 테스트해야한다.

 

어드레서블 프로필
![Alt text](../../../../static/img/230506-unity-addr/image-2.png)

BuildTarget 값으로 플랫폼간의 애셋이 다르다면 설정한다. 같다면 고정값으로 설정해도 무방하다.


## 어드레서블 사용

1. 메모리에 로드한다.
리모트에 있는 애셋의 경우 GetDownloadSizeAsync() 함수를 호출해서 미리 다운로드가 필요해둘 수도 있고 아래와 같이 곧바로 LoadAssetAsync()를 수행해도 리모트 애셋을 메모리에 로드하는 것이 가능하다.
애셋의 사이즈에 따라 미리 다운로드 해둘지, 바로 로드할지 선택해서 사용할 수 있다.

        Addressables.LoadAssetAsync<GameObject>(key).Completed += (op) =>
        {
            if (op.Status != AsyncOperationStatus.Failed)
            {
                instantiateGrid(key);
            }
        };
2. 메모리에 로드한 애셋 Instantiate 

        Addressables.InstantiateAsync(key).Completed += (op1) =>
        {
            op1.Result.GetComponent<Canvas>().worldCamera = mainCamera;
        };
 

## 애셋 번들 모드

<https://blog.unity.com/kr/technology/tales-from-the-optimization-trenches-saving-memory-with-addressables>


하나의 어드레서블 그룹 내에 에셋이 메모리에 로드 된 뒤 자동으로 해제되는 것이 불가능하기 때문에 Bundle Mode를 Pack Separately로 설정하여  어드레서블 그룹을 빌드하면 어드레서블 그룹내에 에섯번들이 독립적으로 패키징 되도록 할 수 있다.
위 방식의 문제점은 서로 다른 애셋번들 패키지 내에 참조하고 있는 애셋이 동일하다면 중복되는 애셋이 메모리에 여러개 올라가는 문제가 있다.
1. 중복된 애셋을 다른 어드레서블 그룹에 추가.

2. 동일하게 참조하고 있는 애셋들을 모두 같은 애셋번들에 묶기.

애셋번들 모드에 대해서는 알아만 보았고 실제 사용하는 애셋 번들모드는 Pack Together, 기본 모드로 설정했다.


## 참고

<https://www.youtube.com/watch?v=EP3pvPAcHSo&ab_channel=UnityKorea >

