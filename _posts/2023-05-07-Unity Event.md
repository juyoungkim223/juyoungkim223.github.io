---
layout: post
title: "Unity UnityEvent, event, delegate, Action"
date: 2023-05-07 20:03:28 +0900
tags: unity event
categories: unity
---
* TOC
{:toc}
Unity UnityEvent, event, delegate, Action.

이벤트 기반의 스크립트 함수 호출을 위한 방법에 대해 정리해보겠다.


## 이벤트 기반의 장점

1. 싱글톤을 사용하여 직접 다른 스크립트의 로직을 호출하는 방식은 강한 결합을 가져 로직의 변화 발생 시 스크립트 수정이 쉽지 않지만 이벤트 기반 함수는 pub / sub스크립트의 변경만으로 가능해진다.
2. 디자인 패턴 중 Model의 역할을 하는 클래스의 멤버필드 값의 변화를 탐지하기 위해  간단한 구현으로는 Update() 함수 내에서 매 프레임마다 체크를 해야할 수 있다.
이벤트 기반의 함수 작성은 불필요한 cpu 낭비를 최소화 하여 Update() 사용을 완전히 제거하여 이벤트 기반으로 대체가능하다.

## UnityEvent, event, delegate, Action 정리

### delegate
+= 를 이용해 subscriber들의 multi-cast 연결 또한 가능하다.
```csharp
    public int Score
    {
        get
        {
            return m_score;
        }
        set
        {
            m_score = value;
            onScoreChanged();
           
        }
    }
	private void onScoreChanged() =>
     OnScoreChangedDel?.Invoke(m_score);
    public delegate void ScoreChangedDelegate(int score);
    // delegate 생성
    public ScoreChangedDelegate OnScoreChangedDel;
```

sub 클래스
```csharp
    private void OnEnable()
    {
        gameScore.OnScoreChangedDel += OnScoreChanged;
    }

    private void OnDisable()
    {
        gameScore.OnScoreChangedDel -= OnScoreChanged;
    }

    private void OnScoreChanged(int score)
    {
        scoreText.SetText(score.ToString());
    }
```
### event

event 인스턴스 생성은 delegate 생성과 유사하다. delegate 생성 시 사용하던 키워드를 event로만 변경한다.
```csharp
    public delegate void ScoreChangedDelegate(int score);
    // event 선언
    public event ScoreChangedDelegate OnScoreChangedDel;
```
subscriber의 구현은 delegate와 마찬가지로 따로 코드를 적지는 않겠다.

 

그렇다면 event와 delegate의 차이는 무엇인가?

event는 delegate의 하위개념이다. 그렇지만 event와 다르게 delegate에서는 아래와 같은 코드가 호출 가능하다.
즉, 다른 스크립트에서 delegate의 변경과 호출이 가능해진다.
```csharp
        gameScore.OnScoreChangedDel = null;
        gameScore.OnScoreChangedDel();
```
event instance를 대상으로

위와 같은 코드를 실행하면 아래와 같은 컴파일러 에러가 발생한다. event는 subscriber의 역할만 수행하는 것을 알 수 있다.

The event 'event' can only appear on the left hand side of += or -= (except when used from within the type 'type')

### Action

System 패키지 선언을 해줘야한다.

using System;
delegate와의 차이는 미리 인스턴스를 생성할 필요가 없다.

특징

1. return type이 없다.

2. 파라미터를 하나 이상 가질 수 있다.
```csharp
    private int m_score;
    public int Score
    {
        get
        {
            return m_score;
        }
        set
        {
            m_score = value;
            onScoreChanged();
        }
    }
    #endregion

    public Action<int> OnScoreChanged;
    // public event Action<int> OnScoreChanged; delegate와 event의 차이와 같다.

    private void onScoreChanged() =>
        OnScoreChanged?.Invoke(m_score);
```

3. Score Property를 이용해서 Score가 변할 때마다 Action을 Invoke한다.
```csharp
    private void OnEnable()
    {
        gameScore.OnScoreChanged += OnScoreChanged;
    }

    private void OnDisable()
    {
        gameScore.OnScoreChanged -= OnScoreChanged;
    }
    
    private void OnScoreChanged(int score)
    {
        scoreText.SetText(score.ToString());
    }
```
OnEnable(), OnDisable() 시점에 delegate가 트리거 될 때 구독한 delegate 가 호출할 함수를 등록해둔다.

Action 에도 event 키워드를 결합해서 사용하면 이벤트 기반 시스템을 조금 더 이상적으로 구현가능하다.

스크립트 상에서는 모듈을 나눠서 결합을 줄이는 방법으로 Action이 많이 사용된다. Inspector에서 관리하기 위한 방법으로는 Unity Event를 이용할 수 있다.

 

### Unity Event

옵저버 패턴을 사용한 버튼의 클릭이벤트인 OnClick()이 Unity Event를 사용한 것으로 에디터에서 클릭 이벤트가 발생할 때 실행할 스크립트 함수들을 등록하는 것으로 익숙하다.

Editor에서 사용해야하기 때문에 특별하게 Unity Event를 이용해본적이 없다. 어떤 차이가 있나 알아보기 위해서 차이점에 대해서만 나열해보면

1. Invoke 시에 delegate나 Action처럼 null check가 필요하지 않다.

2. UnityEvent는 Editor로 이벤트 발생 시 실행될 함수들의 관리가 쉽다. Action이나 delegate는 서로 다른 스크립트간의 연길이기 때문에 관리 측면에서 용이하다.