"use strict";
const previews = {
  web: { name:"공간 예약", kind:"예약 홈페이지", title:"원하는 시간을 선택하세요", values:[["12.05","토요일"],["14:00","예약 가능"],["15:20","예약 가능"]], action:"예약 확인" },
  erp: { name:"주문 관리", kind:"운영 화면", title:"오늘의 주문을 한곳에서", values:[["8건","신규 주문"],["3건","확인 필요"],["5건","처리 완료"]], action:"주문 목록 보기" },
  app: { name:"현장 운영", kind:"업무용 앱", title:"대기와 호출을 바로 확인", values:[["A12","호출 중"],["A13","대기"],["A14","접수"]], action:"접수 목록 보기" }
};
const form=document.getElementById("brief");
const service=document.getElementById("service");
const scope=document.getElementById("scope");
const draft=document.getElementById("draft");
const message=document.getElementById("message");
const status=document.getElementById("form-status");
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
    paste: "문장을 복사해 크몽 문의창에 붙여넣어 주세요.",
    copied: "복사했습니다. 크몽 문의창에 붙여넣어 주세요.",
    selected: "문장을 선택했습니다. 복사 단축키로 복사해 주세요.",
    required: "필요한 기능이나 작업 상황을 적어 주세요."
  },
  en: {
    greeting: name=>"Hello, I'd like to discuss a project: "+name+".",
    fields: ["What we need and how we work now","Preferred timeline","Budget"],
    closing: "Could you share the scope you can deliver, an estimated quote, and your availability?",
    paste: "Copy this text into your Fiverr or Upwork message.",
    copied: "Copied. Paste it into your Fiverr or Upwork message.",
    selected: "The text is selected. Use your device's copy command.",
    required: "Please describe what you need or how you work today."
  },
  ja: {
    greeting: name=>"こんにちは。"+name+"についてご相談です。",
    fields: ["必要な機能と現在の運用","希望時期","予算"],
    closing: "対応可能な範囲、お見積もり、制作日程を教えていただけますでしょうか。",
    paste: "相談文をコピーし、FiverrまたはUpworkのメッセージ欄に貼り付けてください。",
    copied: "コピーしました。FiverrまたはUpworkのメッセージ欄に貼り付けてください。",
    selected: "相談文を選択しました。端末のコピー操作でコピーしてください。",
    required: "必要な機能、または現在の運用を入力してください。"
  }
};
const copyText=translations[document.documentElement.lang] ?? translations.ko;

document.querySelectorAll(".view-tab").forEach(button=>{
  button.addEventListener("click", ()=>{
    const view=previews[button.dataset.preview];
    document.querySelectorAll(".view-tab").forEach(tab=>tab.setAttribute("aria-pressed",String(tab===button)));
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
    document.getElementById("mock-stats").replaceChildren(...stats);
    document.getElementById("mock-action").firstChild.textContent=view.action+" ";
  });
});
document.querySelectorAll("[data-select]").forEach(link=>{
  link.addEventListener("click", ()=>{
    service.value=link.dataset.select;
    draft.hidden=true;
    requestAnimationFrame(()=>scope.focus({preventScroll:true}));
  });
});
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
  message.value=[copyText.greeting(service.selectedOptions[0].textContent),"",details,text,...optional,"",copyText.closing].join("\n");
  for(const [platform,link] of destinations){
    link.href=service.value==="web" ? websiteListing.get(platform) : marketplace[platform];
  }
  draft.hidden=false;
  status.textContent=copyText.paste;
  document.getElementById("copy").focus();
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
