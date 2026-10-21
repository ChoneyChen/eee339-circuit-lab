import('./app.js?v=question-pages-3').catch(error => {
  console.error('Circuit Lab failed to load', error);
  const root=document.querySelector('#main');
  root.innerHTML='<div class="panel"><h1>学习工作台加载遇到问题</h1><p>请刷新页面后重试。若刚发布更新，稍等片刻再刷新；网站需要浏览器支持 JavaScript 模块。</p><button class="btn primary" id="retry-load">重新加载</button></div>';
  document.querySelector('#retry-load').onclick=()=>location.reload();
});
