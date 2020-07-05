---
    layout: null
---

/**
 * 页面ready方法
 */
$(document).ready(function() {
    generateContent();
    // share();
    // gitment();
});

/**
 * 侧边目录
 */
function generateContent() {
    var $mt = $('.toc');
    var toc = $(".post ul#markdown-toc").clone().get(0);
    $mt.each(function(i,o){
        $(o).html(toc);
    });
}

function share(){
    window._bd_share_config={"common":{"bdSnsKey":{},"bdText":"","bdMini":"2","bdMiniList":false,"bdPic":"","bdStyle":"1","bdSize":"24"},"share":{}};
    with(document)0[getElementsByTagName("script")[0].parentNode.appendChild(createElement('script')).src='//bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
}


function gitment() {
    /*var gitment = new Gitment({
        id: window.location.pathname,
        owner: '{{site.github.username}}',
        repo: 'https://juyoungkim223.github.io/gitment',
        oauth: {
            client_id: '9106cc0210f140a41f3d',
            client_secret: '69206a32c946390f071fadf5be5dfa0106201042',
        },
    });
    gitment.render('post-comment')*/

    //$("#post-comment").removeClass('hidden');
}
