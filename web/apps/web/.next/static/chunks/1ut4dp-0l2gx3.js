(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54775,t=>{"use strict";t.s(["formatCurrency",0,function(t){if(null==t)return"PKR 0";let e="string"==typeof t?parseFloat(t):t;return isNaN(e)?"PKR 0":`PKR ${e.toLocaleString("en-PK",{minimumFractionDigits:0,maximumFractionDigits:2})}`}])},39564,90656,t=>{"use strict";function e(t){let e=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${e}-${r}-${a}`}function r(){let t=new Date;return{fromDate:e(new Date(t.getFullYear(),t.getMonth(),1)),toDate:e(t)}}function a(t){let a=new Date,i=e(a);switch(t){case"TODAY":return{fromDate:i,toDate:i};case"THIS_WEEK":{let t=a.getDay();return{fromDate:e(new Date(a.getFullYear(),a.getMonth(),a.getDate()-(t+6)%7)),toDate:i}}case"LAST_30_DAYS":return{fromDate:e(new Date(a.getFullYear(),a.getMonth(),a.getDate()-29)),toDate:i};default:return r()}}function i(t,e){let r=/^\d{4}-\d{2}-\d{2}$/;return t&&r.test(t)?e&&r.test(e)?t>e?{valid:!1,error:"From Date cannot be after To Date."}:{valid:!0}:{valid:!1,error:"Please enter a valid end date (YYYY-MM-DD)."}:{valid:!1,error:"Please enter a valid start date (YYYY-MM-DD)."}}t.s(["getCurrentMonthRange",0,r,"getPresetDateRange",0,a,"validateDateRange",0,i],39564);var o=t.i(43476),n=t.i(71645);t.s(["default",0,function({fromDate:t,toDate:e,onChange:r,disabled:l=!1,className:s="",showPresets:d=!0}){let[m,p]=(0,n.useState)(t),[c,u]=(0,n.useState)(e),[h,x]=(0,n.useState)("THIS_MONTH"),[f,b]=(0,n.useState)("");(0,n.useEffect)(()=>{p(t),u(e)},[t,e]);let g=t=>{b(""),x(t);let e=a(t);p(e.fromDate),u(e.toDate),r(e)},w=(t,e)=>{b(""),x("CUSTOM"),"from"===t?p(e):u(e)};return(0,o.jsxs)("div",{className:`bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-white shadow-sm flex flex-col gap-2 ${s}`,"data-testid":"date-range-filter",children:[(0,o.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("span",{className:"text-sm",children:"📅"}),(0,o.jsx)("span",{className:"text-xs font-bold text-slate-300",children:"Date Range:"})]}),d&&(0,o.jsxs)("div",{className:"flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto",children:[(0,o.jsx)("button",{type:"button",disabled:l,onClick:()=>g("THIS_MONTH"),className:`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${"THIS_MONTH"===h?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,"data-testid":"preset-this-month",children:"This Month"}),(0,o.jsx)("button",{type:"button",disabled:l,onClick:()=>g("TODAY"),className:`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${"TODAY"===h?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,"data-testid":"preset-today",children:"Today"}),(0,o.jsx)("button",{type:"button",disabled:l,onClick:()=>g("THIS_WEEK"),className:`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${"THIS_WEEK"===h?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,"data-testid":"preset-this-week",children:"This Week"})]})]}),(0,o.jsxs)("form",{onSubmit:t=>{t&&t.preventDefault(),b("");let e=i(m,c);e.valid?r({fromDate:m,toDate:c}):b(e.error||"Invalid date range")},className:"flex flex-wrap items-center gap-2 pt-1",children:[(0,o.jsxs)("div",{className:"flex items-center gap-1.5 flex-1 min-w-[240px]",children:[(0,o.jsxs)("div",{className:"flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 transition flex-1",children:[(0,o.jsx)("span",{className:"text-[10px] uppercase font-bold text-slate-500 tracking-wider",children:"From"}),(0,o.jsx)("input",{type:"date",value:m,disabled:l,onChange:t=>w("from",t.target.value),className:"bg-transparent text-xs text-white focus:outline-none w-full font-mono cursor-pointer [color-scheme:dark]","data-testid":"date-filter-from","aria-label":"From Date"})]}),(0,o.jsx)("span",{className:"text-slate-500 text-xs font-bold",children:"→"}),(0,o.jsxs)("div",{className:"flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 transition flex-1",children:[(0,o.jsx)("span",{className:"text-[10px] uppercase font-bold text-slate-500 tracking-wider",children:"To"}),(0,o.jsx)("input",{type:"date",value:c,disabled:l,onChange:t=>w("to",t.target.value),className:"bg-transparent text-xs text-white focus:outline-none w-full font-mono cursor-pointer [color-scheme:dark]","data-testid":"date-filter-to","aria-label":"To Date"})]})]}),(0,o.jsx)("button",{type:"submit",disabled:l,className:"bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer shrink-0","data-testid":"date-filter-apply",children:"Apply"})]}),f&&(0,o.jsxs)("div",{className:"text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg","data-testid":"date-filter-error",children:["⚠️ ",f]})]})}],90656)},33825,t=>{"use strict";t.s(["printThermalReceipt",0,function(t){let e=document.getElementById(t);if(!e)return window.print(),!0;try{let t=document.getElementById("receipt-print-frame");t&&t.remove();let r=document.createElement("iframe");r.id="receipt-print-frame",r.name="receipt-print-frame",r.style.position="fixed",r.style.right="0",r.style.bottom="0",r.style.width="0",r.style.height="0",r.style.border="0",r.style.visibility="hidden",r.setAttribute("aria-hidden","true"),document.body.appendChild(r);let a=r.contentWindow?.document;if(!a)return window.print(),!0;let i=Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(t=>t.outerHTML).join("\n"),o=e.outerHTML;return a.open(),a.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Thermal Receipt</title>
          ${i}
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              animation: none !important;
              transition: none !important;
              word-break: break-word !important;
            }
            html, body {
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
              font-size: 11px !important;
              line-height: 1.35 !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }
            /* 72mm printable width ensures text does not clip on thermal printer hardware margins */
            #order-receipt-bill,
            #thermal-receipt,
            .printable-receipt {
              width: 72mm !important;
              max-width: 72mm !important;
              min-width: 70mm !important;
              margin: 0 auto !important;
              padding: 2mm 3mm !important;
              box-sizing: border-box !important;
              max-height: none !important;
              overflow: visible !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            /* Force all text inside receipts to 100% solid jet-black so thermal print heads print clearly without faint gray dithering */
            #order-receipt-bill *,
            #thermal-receipt *,
            .printable-receipt * {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }
            /* Allow text to wrap naturally instead of cutting off with ellipsis */
            .truncate {
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: clip !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${o}
        </body>
      </html>
    `),a.close(),setTimeout(()=>{try{r.contentWindow?.focus(),r.contentWindow?.print()}catch(t){console.warn("Iframe print error, falling back to window.print():",t),window.print()}},200),!0}catch(t){return console.error("Failed to print thermal receipt via iframe:",t),window.print(),!0}}])}]);