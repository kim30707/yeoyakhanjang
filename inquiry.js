"use strict";
const previews=JSON.parse(document.getElementById("mock-views").textContent);
const form=document.getElementById("brief");
const service=document.getElementById("service");
const scope=document.getElementById("scope");
const scopeHint=document.getElementById("scope-hint");
const draft=document.getElementById("draft");
const message=document.getElementById("message");
const status=document.getElementById("form-status");
const directEmail=document.getElementById("direct-email");
const marketplace = {
  fiverr: "https://www.fiverr.com/kiki_kore",
  upwork: "https://www.upwork.com/freelancers/~0133ffc18fb26ccf91"
};
const destinations = [
  ["fiverr", document.getElementById("destination-fiverr")],
  ["upwork", document.getElementById("destination-upwork")]
].filter(([,link])=>link);
const websiteListing = new Map(destinations.map(([platform,link])=>[platform,link.href]));
const translations = {
  ko: {
    greeting: name=>"안녕하세요. "+name+" 문의드립니다.",
    fields: ["필요한 기능과 현재 상황","희망 일정","예산"],
    closing: "가능한 제작 범위와 견적, 일정을 알려주시면 감사하겠습니다.",
    paste: "이메일로 바로 보내거나, 문장을 복사해 크몽 문의창에 붙여넣을 수 있습니다.",
    copied: "문의 문장을 복사했습니다.",
    selected: "문장을 선택했습니다. 복사 단축키로 복사해 주세요.",
    required: "필요한 기능이나 작업 상황을 적어 주세요."
  },
  en: {
    greeting: name=>"Hello, I'd like to discuss a project: "+name+".",
    fields: ["What we need and how we work now","Preferred timeline","Budget"],
    closing: "Could you share the scope you can deliver, an estimated quote, and your availability?",
    paste: "Send it by email, or copy this text into your marketplace message.",
    copied: "Inquiry text copied.",
    selected: "The text is selected. Use your device's copy command.",
    required: "Please describe what you need or how you work today."
  },
  ja: {
    greeting: name=>"こんにちは。"+name+"についてご相談です。",
    fields: ["必要な機能と現在の運用","希望時期","予算"],
    closing: "対応可能な範囲、お見積もり、制作日程を教えていただけますでしょうか。",
    paste: "メールで直接送信するか、相談文を各サービスのメッセージ欄に貼り付けてください。",
    copied: "相談文をコピーしました。",
    selected: "相談文を選択しました。端末のコピー操作でコピーしてください。",
    required: "必要な機能、または現在の運用を入力してください。"
  }
};
const copyText=translations[document.documentElement.lang] ?? translations.ko;
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
const mockMain=document.querySelector(".mock-main");
const mockStats=document.getElementById("mock-stats");
const formCard=document.querySelector(".form-card");

function showScopeHint(){
  scopeHint.textContent=service.selectedOptions[0].dataset.hint;
}

function renderPreview(view){
  document.getElementById("mock-label").textContent=view.name;
  document.getElementById("mock-kicker").textContent=view.kind;
  document.getElementById("mock-title").textContent=view.title;
  const stats=view.values.map(([value,note])=>{
    const box=document.createElement("span");
    const label=document.createElement("small");
    box.textContent=value;
    label.textContent=note;
    box.append(label);
    return box;
  });
  mockStats.replaceChildren(...stats);
  document.getElementById("mock-action").textContent=view.action;
}
let swapToken=0;
document.querySelectorAll(".view-tab").forEach(button=>{
  button.addEventListener("click", ()=>{
    const view=previews[button.dataset.preview];
    document.querySelectorAll(".view-tab").forEach(tab=>tab.setAttribute("aria-pressed",String(tab===button)));
    mockStats.classList.add("is-swapped");
    if(reduceMotion.matches || !mockMain.animate){
      renderPreview(view);
      return;
    }
    const token=++swapToken;
    mockMain.getAnimations().forEach(animation=>animation.cancel());
    mockMain.animate([{opacity:1},{opacity:0,translate:"0 -4px"}],{duration:90,easing:"ease-in"}).finished
      .then(()=>{
        if(token!==swapToken) return;
        renderPreview(view);
        mockMain.animate([{opacity:0,translate:"0 6px"},{opacity:1,translate:"0 0"}],{duration:200,easing:"cubic-bezier(.2,.8,.2,1)"});
      })
      .catch(()=>{ if(token===swapToken) renderPreview(view); });
  });
});
document.querySelectorAll("[data-select]").forEach(link=>{
  link.addEventListener("click", ()=>{
    service.value=link.dataset.select;
    showScopeHint();
    scope.setCustomValidity("");
    status.textContent="";
    draft.hidden=true;
    formCard.classList.remove("is-picked");
    void formCard.offsetWidth;
    formCard.classList.add("is-picked");
    setTimeout(()=>formCard.classList.remove("is-picked"),1200);
    requestAnimationFrame(()=>scope.focus({preventScroll:true}));
  });
});
service.addEventListener("change",showScopeHint);
form.addEventListener("input", ()=>{
  draft.hidden=true;
  status.textContent="";
  scope.setCustomValidity("");
});
form.addEventListener("submit", event=>{
  event.preventDefault();
  const data=new FormData(form);
  const text=scope.value.trim();
  if(!text){
    scope.setCustomValidity(copyText.required);
    scope.reportValidity();
    return;
  }
  const [details,timeline,budget]=copyText.fields;
  const optional=[[timeline,data.get("when").trim()],[budget,data.get("budget").trim()]]
    .filter(([,value])=>value).map(([label,value])=>label+" — "+value);
  const serviceName=service.selectedOptions[0].textContent;
  message.value=[copyText.greeting(serviceName),"",details,text,...optional,"",copyText.closing].join("\n");
  const subject=encodeURIComponent("[SEM-WEB-INQUIRY] "+serviceName);
  const body=encodeURIComponent(message.value.replace(/\n/g,"\r\n"));
  directEmail.href="mailto:kim30707@gmail.com?subject="+subject+"&body="+body;
  for(const [platform,link] of destinations){
    link.href=service.value==="web" ? websiteListing.get(platform) : marketplace[platform];
  }
  draft.hidden=false;
  status.textContent=copyText.paste;
  directEmail.focus();
});
document.getElementById("copy").addEventListener("click",async ()=>{
  try{
    await navigator.clipboard.writeText(message.value);
    status.textContent=copyText.copied;
  }catch{
    message.focus();
    message.select();
    status.textContent=copyText.selected;
  }
});
form.hidden=false;

document.querySelectorAll("[data-demo]").forEach(demo=>{
  const choices=demo.querySelectorAll("[data-demo-choice]");
  const result=demo.querySelector("output");
  choices.forEach(choice=>{
    choice.addEventListener("click",()=>{
      choices.forEach(other=>other.setAttribute("aria-pressed",String(other===choice)));
      result.textContent=choice.textContent.trim();
      result.classList.remove("bump");
      void result.offsetWidth;
      result.classList.add("bump");
    });
  });
});

// 첫 화면 등장이 끝나면 등장용 애니메이션을 떼어 냄(탭 전환 때 다시 돌지 않게)
const hero=document.querySelector("[data-enter]");
if(hero) setTimeout(()=>hero.classList.add("entered"),1600);

// 흐름도 신호: 화면에 보이면 한 번(2회 반복, 4.4초) 흐르고, 마우스를 올리면 다시
function replayFlow(demo){
  demo.classList.remove("is-live");
  void demo.offsetWidth;
  demo.classList.add("is-live");
}
const flows=document.querySelectorAll(".program-demo");
if("IntersectionObserver" in window){
  const seen=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        replayFlow(entry.target);
        seen.unobserve(entry.target);
      }
    });
  },{threshold:.6});
  flows.forEach(demo=>seen.observe(demo));
}
flows.forEach(demo=>demo.addEventListener("pointerenter",()=>replayFlow(demo)));
