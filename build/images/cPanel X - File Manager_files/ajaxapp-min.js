(function(e){"use strict";var t=e.document,n=e.YAHOO,r=e.CPANEL,i=e.DOM,s=e.EVENT,o=e.LOCALE;r.namespace("ajax"),r.namespace("datatable");var u=o.maketext("An unknown error occurred."),a=r.dom.isRtl(),f=.25;String.prototype.elide=function(e){var t=new RegExp(a?".+(.{"+e+"})$":"^(.{"+e+"}).+");return t.test(this)?this.replace(t,"$1…"):this.valueOf()};var l={info:r.icons.info,warn:r.icons.warning,error:r.icons.error},c={effect:r.animate.ContainerEffect.FADE_MODAL,duration:f};r.ajax.FADE_MODAL=c,r.ajax.templates={};var h=function(){var e=r.Y.all('script[type="text/plain"], script[type="text/html"]');for(var t=e.length-1;t>=0;t--){var n=e[t];r.ajax.templates[n.id]=n.text.trim()}};n.util.Event.onDOMReady(h),r.datatable.get_api_data=function(e){e.getState&&(e=e.getState());var t={filter:[],paginate:{start:e.pagination.recordOffset,size:e.pagination.rowsPerPage}},r=e.sortedBy&&e.sortedBy.key;return r&&(e.sortedBy.dir===n.widget.DataTable.CLASS_DESC&&(r="!"+r),t.sort=[r]),t};var p=function(e){var t;if(!e)t=u;else{if("status"in e&&e.status!==200){var i=r.api.get_transaction_args(e.tId),s=e.getAllResponseHeaders||"";s&&(s=s.trim().split(/[\r\n]+/).sort().join("\n").html_encode());var o=e.responseText||"";return n.lang.substitute(r.ajax.templates.cjt_http_error_dialog_template,{status:e.status,status_text_html:e.statusText.html_encode(),method:i?i[0]:"",url_html:i?i[1].html_encode():"",post_html:(i&&i[3]||"").html_encode(),response_html:(s+"\n\n"+o.html_encode()).trim()})}if(e.cpanel_messages&&e.cpanel_messages.length){var a=e.cpanel_messages;t=e.cpanel_error?'<span class="cjt-page-callback-main-error">'+e.cpanel_error.html_encode()+"</span>":"",t+='<ul class="cjt-page-callback-messages">',t+=a.map(function(t){if(t.level!=="error"||t.content!==e.cpanel_error)return"<li>"+l[t.level]+" "+t.content.html_encode()+"</li>"}).join(""),t+="</ul>"}else e.responseText&&(t=e.responseText.html_encode())}return t||(t=String(e).html_encode()),t},d;r.ajax.build_page_callback=function(e,t){t||(t={});var n=t.hide_on_return?function(){var e=t.hide_on_return instanceof Array?t.hide_on_return:[t.hide_on_return];e.forEach(function(e){e.animated_hide?e.animated_hide():e.hide()})}:null,i={};return i.success=function(){n&&n(),e&&e.apply(this,arguments)},i.failure=function(e){n&&n();if(e&&e.status&&e.status===-1){t.on_cancel&&t.on_cancel.apply(this,arguments);return}r.ajax.show_api_error(e,t.pagenotice_container),t.on_error&&t.on_error(e)},i},r.ajax.show_api_error=function(e,t){var o;typeof e=="object"?o=p(e):o=e;var u;if(d&&d.cfg&&i.inDocument(d.element))d.cfg.setProperty("content",o),u=d.element.offsetHeight;else{d=new r.widgets.Dynamic_Page_Notice({container:t,level:"error",content:o,visible:!1});var a=d.animated_show();u=a.attributes.height.to}s.on(r.Y.all(".http_error_details_link"),"click",function(){var e=i.getAncestorByClassName(this,"http_error_notice"),t=r.Y(e).one(".cjt_error_details");r.animate.slide_toggle(t)});var f=i.getY(d.element);(new r.animate.WindowScroll(new n.util.Region(f,1,f+u,0))).animate()},r.ajax.build_callback=function(i,s,u){var a,f;u||(u={}),s&&(a=s.current,f=s.after_error);var l={};return l.failure=function(i){u.failure&&u.failure.apply(this,arguments);var s,l;if(typeof i=="object"&&"status"in i&&i.status!==200){if(!(i.status>=0)){u.on_cancel&&u.on_cancel.call(this,i);return}l=!0}s=p(i),"console"in e&&e.console.warn("API error:",i);var h;f?h=function(){var e=this;e.fade_to(f),e.after_hideEvent.subscribe(e.destroy,e,!0)}:h=function(){this.cancel()};var d=new E(null,{buttons:[{text:o.maketext("OK"),handler:h,isDefault:!0}]}),v=this.header?this.header.innerHTML:l?o.maketext("HTTP ERROR"):o.maketext("ERROR");v=r.widgets.Dialog.applyDialogHeader(v),d.setHeader(v),l?d.setBody(s):d.setBody(n.lang.substitute(r.ajax.templates.cjt_error_dialog_template,{error_html:s})),d.render(t.body),d.center(),u.on_error&&d.cancelEvent.subscribe(u.on_error),a?(a.fade_to(d),f||a.after_hideEvent.subscribe(a.destroy,a,!0)):d.show(),f||d.cfg.setProperty("effect",c)},l.success=function(e){i&&i.call(this,e);if(a&&!u.keep_current_on_success)if(s.success)a.fade_to(s.success);else{var t=a.cfg.getProperty("effect");a.cfg.setProperty("effect",c),a.after_hideEvent.subscribe(function n(){this.after_hideEvent.unsubscribe(n),this.cfg.setProperty("effect",t),a.cfg&&a.destroy()}),a.hide()}},l};var v=function(e,t){var s={visible:!1};e||(e=i.generateId()),t||(t={}),"show_status"in t||(t.show_status=!!t.status_html),n.lang.augmentObject(t,s),this.cfg||n.widget.Overlay.call(this,e),this.beforeInitEvent.fire(g),i.addClass(this.element,"cjt-progress-overlay"),this.cfg.applyConfig(t,!0);var o='<div class="cjt-progress-overlay-body-liner">';switch(this.cfg.getProperty("format")){case"throbber":i.addClass(this.element,"throbber"),o+='<div class="loader-tool"><div class="loader"></div></div>';break;case"spinner":i.addClass(this.element,"spinner");break;default:throw"PO format"}t.show_status&&(o+='<div class="cjt-progress-overlay-text-container"><span class="cjt-progress-overlay-text">'+(t.status_html||"&nbsp;")+"</span></div>",this.renderEvent.subscribe(function u(){this.renderEvent.unsubscribe(u);var e=r.Y(this.body).one("span.cjt-progress-overlay-text");this.fading_text_field=new r.ajax.Fading_Text_Field(e)})),o+="</div>",this.setBody(o),this.throbber=this.body.firstChild.firstChild,i.setStyle(this.body,"border",0)};n.lang.extend(v,n.widget.Overlay,{throbber:null,fading_text_field:null,initDefaultConfig:function(e){e||v.superclass.initDefaultConfig.call(this),this.cfg.addProperty("show_status",{value:!1}),this.cfg.addProperty("status_html",{value:""}),this.cfg.addProperty("covers",{value:null}),this.cfg.addProperty("format",{value:"throbber"})},set_status:function(e){this.cfg.setProperty("status_html",e),this.cfg.getProperty("show_status")&&this.fading_text_field.set_html(e)},set_status_now:function(e){this.cfg.setProperty("status_html",e),this.cfg.getProperty("show_status")&&this.fading_text_field.set_html_now(e)},align:function(){v.superclass.align.apply(this,arguments);var e=this.cfg.getProperty("covers");if(e&&(e=i.get(e))){var t=e.offsetWidth,n=e.offsetHeight;t!==this._covered_width&&(this._covered_width=t,this.cfg.setProperty("width",t+"px")),n!==this._covered_height&&(this._covered_height=n,this.cfg.setProperty("height",n+"px"))}}}),r.ajax.Progress_Overlay=v;var m=function(e,o){o||(o={});var u={effect:{effect:n.widget.ContainerEffect.FADE,duration:f}};o.covers&&(u.context=[o.covers,"tl","tl",["windowResize","textResize"]],u.zIndex=parseInt(r.dom.get_zindex(i.get(o.covers)),10)+1),n.lang.augmentObject(o,u),m.superclass.constructor.call(this,e,o),this.renderEvent.subscribe(function(){i.addClass(this.element,"cjt-page-progress-overlay")}),this.make_autorender();var a=[],l;this.beforeShowEvent.subscribe(function(){var e=this.cfg.getProperty("covers");if(e&&(e=i.get(e))){var o=this;this._covered_opacity||(this._covered_opacity=i.getStyle(e,"opacity")),this._fade&&this._fade.stop(),this._fade=new n.util.Anim(e,{opacity:{to:this._covered_opacity/4}},f),this._fade.onComplete.subscribe(function(){o._fade=null}),this._fade.animate();var u=r.Y(e).all("input, button, textarea, select"),c=0,h=u[c];while(h)h.disabled||(a.push(h),h===t.activeElement&&(l=h,h.blur()),h.disabled=!0),c++,h=u[c];s.on(e,"focusin",t.focus,t,!0)}}),this.beforeHideEvent.subscribe(function(){var e=this.cfg.getProperty("covers");if(e&&(e=i.get(e))){var r=this;this._fade&&this._fade.stop(),this._fade=new n.util.Anim(e,{opacity:{to:this._covered_opacity}},f),this._fade.onComplete.subscribe(function(){r._fade=null}),this._fade.animate();for(var o=a.length-1;o>=0;o--){var u=a[o];u.disabled=!1,u===l&&(u.focus(),l=null)}a=[],s.removeListener(e,"focusin",t.focus)}}),this.after_hideEvent.subscribe(this.destroy,this,!0)};n.lang.extend(m,v),r.ajax.Page_Progress_Overlay=m;var g=function(e,t){var r={modal:!0,fixedcenter:!0,draggable:!1,dragOnly:!0,close:!1,underlay:"none",monitorresize:!1,visible:!1};e?typeof e=="object"&&(t=e,e=i.generateId()):e=i.generateId(),t||(t={}),n.lang.augmentObject(t,r),n.widget.Panel.call(this,e),v.call(this,e,t),this.beforeInitEvent.fire(g),i.addClass(this.element,"cjt_progress_panel_container"),i.addClass(this.innerElement,"cjt_progress_panel"),this.cfg.applyConfig(t,!0),this.make_autorender(),this._modalFocus||this._createHiddenFocusElement()};n.lang.extend(g,n.widget.Panel,{initDefaultConfig:function(){g.superclass.initDefaultConfig.call(this),v.prototype.initDefaultConfig.call(this,!0)}}),n.lang.augment(g,v),r.ajax.Progress_Panel=g,r.ajax.Fading_Text_Field=function(e){e=i.get(e),i.addClass(e,"cjt-fading-text-field"),this._dom_node=e,this._dom_node_parent=e.parentNode,this._prototype_node=e.cloneNode(!1),this._prototype_node.style.display="none",this._prototype_node.style.position="absolute"},n.lang.augmentObject(r.ajax.Fading_Text_Field.prototype,{_fade_in:null,_fade_in_el:null,_fade_out:null,_dom_node:null,_dom_node_parent:null,set_html_now:function(e){this._fade_in&&this._fade_in.stop(),this._fade_out&&this._fade_out.stop(),this._dom_node.innerHTML=e,i.setStyle(this._dom_node,"opacity",""),this._fade_in=null,this._fade_out=null},set_html:function(e){var t=this._dom_node,n=this._dom_node_parent,s=this._fade_in&&this._fade_in.isAnimated()&&this._fade_in,o=this._fade_out&&this._fade_out.isAnimated()&&this._fade_out;!s&&o&&(o.stop(),o=!1);var u=this._prototype_node.cloneNode(!1);u.id=i.generateId(),u.innerHTML=e,n.insertBefore(u,this._dom_node),this._dom_node=u,s&&(this._fade_in.stop(),n.removeChild(this._fade_in_el)),this._fade_in=r.animate.fade_in(u),this._fade_in_el=u,!o&&i.inDocument(t)&&(o=r.animate.fade_out(t),o.onComplete.subscribe(function(){n.removeChild(t),u.style.position=""}),this._fade_out=o)}}),n.widget.Panel.prototype.fade_to=function(e){var t=this,s=t.cfg.getProperty("modal"),o=e.cfg.getProperty("modal"),u,a,l,h;if(s&&o){h=e.cfg.getProperty("effect"),e.element&&i.inDocument(e.element)?e.cfg.setProperty("effect",null):e.cfg.queueProperty("effect",null),e.cfg.setProperty("zIndex",this.cfg.getProperty("zIndex")+1);var p=this.mask,d=e.mask;d&&i.inDocument(d)&&d.parentNode.removeChild(d),p.id=e.id+"_mask",e.mask=p,this.mask=null,a=new n.util.Anim(t.element,{opacity:{to:0}},f),a.onComplete.subscribe(function(){delete t._fade,t.hide(),t.cfg&&i.setStyle(t.element,"opacity","")}),"_fade"in this&&(l=this.hide,this.hide=function(){},this._fade.stop(),this.hide=l),this._fade=a,a.animate(),i.setStyle(e.element,"opacity",0),e.show();var v=parseFloat(r.dom.get_zindex(p))+1;i.setStyle(this.element,"z-index",v),u=new n.util.Anim(e.element,{opacity:{to:1}},f),u.onComplete.subscribe(function(){i.setStyle(e.element,"opacity",""),e.cfg.setProperty("effect",h),delete e._fade}),"_fade"in e&&(l=e.hide,e.hide=function(){},e._fade.stop(),e.hide=l),e._fade=u,u.animate()}else{var m={effect:n.widget.ContainerEffect.FADE,duration:f},g=t.cfg.getProperty("effect");h=e.cfg.getProperty("effect");var y=s?c:m,b=o?c:m;t.hideEvent.subscribe(function w(){this.hideEvent.unsubscribe(w),this.cfg.setProperty("effect",g,!0)}),e.hideEvent.subscribe(function E(){this.hideEvent.unsubscribe(E),this.cfg.setProperty("effect",h,!0)}),t.cfg.setProperty("effect",y,!0),e.cfg.setProperty("effect",b,!0),t.hide(),e.show()}},n.widget.Panel.prototype.show_from_source=function(e){var t,s;e instanceof Array?s=e:(t=i.get(e),s=w(t));var o=this.element,u=o.style,a=this.cfg.getProperty("modal");i.setStyle(o,"opacity",0),a&&this.beforeShowMaskEvent.subscribe(function S(){this.beforeShowMaskEvent.unsubscribe(S),i.setStyle(this.mask,"opacity",0)});var l=this._already_shown;l||this.beforeShowEvent.subscribe(function x(){this.beforeShowEvent.unsubscribe(x),this.center(),this._already_shown=!0}),this.show();var c=i.getXY(o),h=this.innerElement,p=h.style,d=p.width,v=p.height,m=u.width,g=u.height,y=r.dom.get_content_width(h)+"px",b=r.dom.get_content_height(h)+"px";p.width=y,p.height=b,u.width=0,u.height=0,i.addClass(o,"cjt_panel_animating"),i.setStyle(o,"opacity","");var E=new n.util.Motion(o,{points:{from:s,to:c},width:{from:0,to:parseFloat(y)},height:{from:0,to:parseFloat(b)}},f);return E.animate(),E.onComplete.subscribe(function(){p.width=d,p.height=v,u.width=m,u.height=g,i.removeClass(o,"cjt_panel_animating")}),a&&(this.mask.style.visibility="hidden",i.setStyle(this.mask,"opacity",""),r.animate.fade_in(this.mask),this.mask.style.visibility=""),E},n.widget.Panel.prototype.hide_to_point=function(e){var t;e instanceof Array||(t=i.get(e),e=w(t));var s=this,o=this.element;o.style.overflow="hidden";var u=i.getXY(o),a=new n.util.Motion(o,{points:{from:u,to:e},width:{to:0},height:{to:0}},f);a.animate();var l;return this.mask&&(l=r.animate.fade_out(this.mask)),a.onComplete.subscribe(function(){l&&l.stop(!0),s.hide(),i.setXY(o,u),o.style.height="",o.style.width="";if(t&&t.focus){var e=r.dom.get_viewport_region().contains(i.getRegion(t));e&&t.focus()}}),a},n.widget.Module.prototype.make_autorender=function(){var e=this.show,n=!1;this.renderEvent.subscribe(function(){n=!0}),this.show=function(){return n||(this.render(t.body),n=!0),this.show=e,e.apply(this,arguments)}};var y={modal:!0,draggable:!0,close:!1,visible:!1,postmethod:"manual",hideaftersubmit:!1,constraintoviewport:!0,dragOnly:!0,effect:null,buttons:[{text:o.maketext("Proceed"),handler:function(){this.submit()},isDefault:!0},{text:o.maketext("Cancel"),classes:"cancel",handler:function(){this.cancel()}}]},b=function(e,s){e&&typeof e=="object"?(s=e,e=i.generateId()):e||(e=i.generateId()),s||(s={});var o=!("buttons"in s);n.lang.augmentObject(s,y);if(o){var u=[];for(var a=s.buttons.length-1;a>=0;a--)u[a]=n.lang.augmentObject({},s.buttons[a]);s.buttons=u}b.superclass.constructor.call(this,e),this.beforeInitEvent.fire(b),i.addClass(this.element,"cjt_common_dialog_container"),this.cfg.applyConfig(s,!0),this.setHeader(r.widgets.Dialog.applyDialogHeader("&nbsp;")),this.setBody(""),this.make_autorender();var l=this;this.form.onsubmit=function(){return!1},this.cfg.getProperty("draggable")&&this.cfg.getProperty("fixedcenter")&&(this.showEvent.subscribe(function(){this.cfg.setProperty("fixedcenter",!1,!1)}),this.hideEvent.subscribe(function(){i.setStyle(this.element,"left",""),i.setStyle(this.element,"top",""),this.cfg.setProperty("fixedcenter",!0,!1)})),this.cancelEvent.subscribe(function(){this.after_hideEvent.subscribe(function e(){this.after_hideEvent.unsubscribe(e),l.cfg&&l.destroy()})}),this.manualSubmitEvent.subscribe(function(){if(this.cfg.getProperty("progress_overlay")){var e=i.getRegion(this.body),s=i.getRegion(this.footer),o=parseFloat(r.dom.get_zindex(this.element))+1,u=t.createElement("div");u.style.display="none",t.body.appendChild(u);var a="<div class='cjt_common_dialog_mask' style='position:absolute;visibility:hidden;z-index:{z_index};background-color:{body_background_color};width:{body_inner_width}px;height:{body_inner_height}px;'>&nbsp;</div><div class='cjt_common_dialog_mask' style='position:absolute;visibility:hidden;z-index:{z_index};background-color:{footer_background_color};width:{footer_inner_width}px;height:{footer_inner_height}px;'>&nbsp;</div>",h=n.lang.substitute(a,{z_index:o,body_background_color:r.dom.get_background_color(this.body),body_inner_width:e.width,body_inner_height:e.height,footer_background_color:r.dom.get_background_color(this.footer),footer_inner_width:s.width,footer_inner_height:s.height});u.innerHTML=h;var p=u.firstChild,d=u.lastChild,m=i.getStyle(p,"opacity");if(!m||m==1)m=.7;i.setStyle(p,"opacity",0),i.setStyle(d,"opacity",0),p.style.visibility="",d.style.visibility="";var g=new n.util.Anim(p,{opacity:{to:m}},f),y=new n.util.Anim(d,{opacity:{to:m}},f);this.body.appendChild(p),this.footer.appendChild(d),t.body.removeChild(u),i.setXY(p,[e.left,e.top]),i.setXY(d,[s.left,s.top]),g.animate(),y.animate();var b=new v(null,{zIndex:o+1,visible:!1,show_status:this.cfg.getProperty("show_status"),effect:{effect:n.widget.ContainerEffect.FADE,duration:f},status_html:this.cfg.getProperty("status_html")});b.render(this.body),b.beforeShowEvent.subscribe(function(){i.setXY(this.element,[e.left+e.width/2-this.element.offsetWidth/2,(s.bottom+e.top)/2-this.element.offsetHeight/2])}),b.show(),this.progress_overlay=b;var w=new n.widget.Panel(i.generateId(),{modal:!0,x:i.getX(this.element),y:i.getY(this.element),visible:!1});w.render(this.element),w.buildMask(),i.setStyle(w.element,"opacity",0),i.setStyle(w.mask,"opacity",0),w.show();var E=function(){w.cfg&&w.destroy()};b.destroyEvent.subscribe(E),b.beforeHideEvent.subscribe(function S(){this.beforeHideEvent.unsubscribe(S),E();var e=new n.util.Anim(p,{opacity:{to:0}},f),t=new n.util.Anim(d,{opacity:{to:0}},f);e.onComplete.subscribe(function(){l.body&&l.body.removeChild(p)}),t.onComplete.subscribe(function(){l.footer&&l.footer.removeChild(d)}),e.animate(),t.animate()}),b.after_hideEvent.subscribe(b.destroy,b,!0),this.beforeHideEvent.subscribe(function x(){this.beforeHideEvent.unsubscribe(x),w.cfg&&w.destroy()}),this.hideEvent.subscribe(function(){b.cfg&&(b.cfg.setProperty("effect",null),b.hide())})}else this.cfg.getProperty("modal")&&this.cfg.setProperty("effect",c),this.hide()})};b.default_options=y,n.lang.extend(b,n.widget.Dialog,{initDefaultConfig:function(){n.widget.Dialog.prototype.initDefaultConfig.call(this),this.cfg.addProperty("progress_overlay",{value:!0}),this.cfg.addProperty("show_status",{value:!1}),this.cfg.addProperty("status_html",{value:""})},destroy:function(){return this.progress_overlay&&(this.progress_overlay.cfg&&this.progress_overlay.destroy(),this.progress_overlay=null),b.superclass.destroy.apply(this,arguments)},showMacGeckoScrollbars:function(){},hideMacGeckoScrollbars:function(){}}),r.ajax.Common_Dialog=b;var w=function(e){var t=i.getXY(e);return t[0]+=(parseFloat(i.getStyle(e,"width"))||e.offsetWidth)/2,t[1]+=(parseFloat(i.getStyle(e,"height"))||e.offsetHeight)/2,t},E=function(e,t){e&&typeof e=="object"?(t=e,e=i.generateId()):e||(e=i.generateId()),t||(t={}),n.lang.augmentObject(t,{fixedcenter:!0,width:"400px",buttons:[{text:o.maketext("OK"),handler:this.cancel,isDefault:!0}]}),E.superclass.constructor.call(this,e),this.beforeInitEvent.fire(E),i.addClass(this.element,"cjt_notice_dialog cjt_error_dialog"),this.cfg.applyConfig(t,!0),this.beforeRenderEvent.subscribe(function(){(!this.header||!this.header.innerHTML)&&this.setHeader(r.widgets.Dialog.applyDialogHeader(o.maketext("Error")))})};n.lang.extend(E,b),r.ajax.Error_Dialog=E;var S=function(e,i){i||(i={}),S.superclass.constructor.call(this,e,i);if(i.header_html){var s=i.header_html;s=r.widgets.Dialog.applyDialogHeader(s),this.setHeader(s)}var u=this;if(i.preload){var a=new g;a.render(t.body),i.clicked_element?a.show_from_source(i.clicked_element):a.show(),a.after_hideEvent.subscribe(a.destroy,a,!0);var f={application:i.preload.api_application,module:i.preload.api_module,func:i.preload.api_function,data:i.preload.data,api_data:i.preload.api_data,callback:null},l=i.preload.success_function,c=r.ajax.build_callback(function(){l&&l.apply(u,arguments),u.beforeShowEvent.subscribe(function o(){u.beforeShowEvent.unsubscribe(o),u.center()});var e=u.cfg.getProperty("form_template");if(e){var t=i.form_template_variables,s=r.ajax.templates[e]||e;u.form.innerHTML=n.lang.substitute(s,t||{})}},{current:a,success:u},{whm:i.preload.api_application&&i.preload.api_application==="whm"||r.is_whm()});f.callback=c,r.api(f)}else if(i.form_template){var h=i.form_template_variables||{},d=r.ajax.templates[i.form_template]||i.form_template;this.form.innerHTML=n.lang.substitute(d,h)}this.manualSubmitEvent.subscribe(function(){var e=this.cfg.getProperty("api_calls");if(!e)return;var t=0,s=function(){var a=e[t],f=t===0,l=t===e.length-1;t++;var c;a.data?a.data instanceof Function?c=a.data.apply(u):c=a.data:c=r.dom.get_data_from_form(u.form);var h;l?h=function(){a.success_function&&a.success_function.apply(u,arguments);if(u.cfg.getProperty("show_status")){var e=u.cfg.getProperty("success_notice_options")||{};e.content||(e.content=u.cfg.getProperty("success_status")||o.maketext("Success!"),e.level||(e.level="success")),u.notice=new A(e)}u.cfg.getProperty("success_function")&&u.cfg.getProperty("success_function").call(u)}:h=function(){a.success_function&&a.success_function.apply(u,arguments),s()};var d=i.show_status&&(a.status_template||i.status_template);if(d){var v={};for(var m in c)c.hasOwnProperty(m)&&(v[m]=String(c[m]).html_encode());var g=n.lang.substitute(d,v);f?u.progress_overlay.set_status_now(g):u.progress_overlay.set_status(g),u.progress_overlay.align()}var y;if(u.cfg.getProperty("errors_in_notice_box"))y={success:function(){return u.cfg.getProperty("no_hide_after_success")||u.animated_hide(),h.apply(this,arguments)},failure:function(e){u.progress_overlay.hide(),u._api_error_notice=new r.widgets.Dynamic_Page_Notice({replaces:u._api_error_notice,container:r.Y(u.form).one(".details-error-notice"),level:"error",content:p(e)});if(a.on_error)return a.on_error.apply(this,arguments)}};else{var b=f&&u.cfg.getProperty("try_again_after_error");y=r.ajax.build_callback(h,{current:u,after_error:b?u:undefined},{on_error:a.on_error,whm:a.api_application&&a.api_application==="whm"||r.is_whm(),keep_current_on_success:!l||u.cfg.getProperty("no_hide_after_success")})}r.api({application:a.api_application,module:a.api_module,func:a.api_function,api_data:a.api_data,data:c,callback:y})};s()})};n.lang.extend(S,b,{initDefaultConfig:function(){S.superclass.initDefaultConfig.call(this);var e=["header_html","form_template","form_template_variables","clicked_element","status_template","api_calls","preload","no_hide_after_success","success_function","success_status","success_notice_options",["errors_in_notice_box",!1],["try_again_after_error",!0]],t=this;e.forEach(function(e){e instanceof Array?t.cfg.addProperty(e[0],{value:e[1]}):t.cfg.addProperty(e,{value:null})})},animated_show:function(){var e=this.cfg.getProperty("clicked_element");if(e){var t=this.show_from_source(e);return t}this.show()},animated_hide:function(){var e=this.cfg.getProperty("clicked_element");if(e){var t=this.hide_to_point(e);return t}this.hide()}}),r.ajax.Common_Action_Dialog=S,r.dom.set_form_defaults=function(e){var t=e.elements;for(var n=t.length-1;n>=0;n--){var r=t[n];if(r.tagName.toLowerCase()==="select"){var i=r.options;for(var s=i.length-1;s>=0;s--){var o=i[s];o.defaultSelected=o.selected}}else"defaultChecked"in r&&(r.defaultChecked=r.checked),"defaultValue"in r&&(r.defaultValue=r.value)}};var x=t.createElement("option");x.innerHTML="test";var T=x.value!==x.innerHTML;r.dom.TRIM_FORM_DATA=!0,r.dom.get_data_from_form=function(e,i){typeof e=="string"&&(e=t.getElementById(e));var s,o;i&&i.url_instead?(o=[],s=function(e,t){r.dom.TRIM_FORM_DATA&&typeof t=="string"&&(t=t.trim()),o.push(encodeURIComponent(e)+"="+encodeURIComponent(t))}):(o={},s=function(e,t){r.dom.TRIM_FORM_DATA&&typeof t=="string"&&(t=t.trim()),e in o?n.lang.isArray(o[e])?o[e].push(t):o[e]=[o[e],t]:o[e]=t});var u=e.elements,a=u.length;for(var f=0;f<a;f++){var l=u[f];if("value"in l&&"name"in l&&l.name&&!l.disabled){var c=l.nodeName.toLowerCase();if(c==="input"){var h=l.type.toLowerCase();switch(h){case"radio":l.checked&&s(l.name,l.value);break;case"checkbox":l.checked?s(l.name,l.value):i&&"include_unchecked_checkboxes"in i&&s(l.name,i.include_unchecked_checkboxes);break;default:s(l.name,l.value)}}else if(c==="select"){var p,d;if(l.selectedIndex!==-1){var v=l.name;if(l.multiple){var m=l.options,g=m.length;for(var y=0;y<g;y++)p=m[y],p.selected&&!p.disabled&&(T&&!p.getAttributeNode("value").specified?d=p.innerText:d=p.value,s(v,d))}else p=l.options[l.selectedIndex],T&&!p.getAttributeNode("value").specified?d=p.innerText:d=p.value,s(v,d)}}else c==="button"?s(l.name,l.value):c==="textarea"&&s(l.name,l.value.replace(/\r\n?/g,"\n"))}}return i&&i.url_instead?o.join("&"):o};var N=function(){var e=t.styleSheets[0];return e||(t.head.appendChild(t.createElement("style")),e=t.styleSheets[0]),"insertRule"in e?N=function(t){for(var n=0;n<t.length;n++)e.insertRule(t[n][0]+" {"+t[n][1]+"}",0)}:N=function(t){for(var n=0;n<t.length;n++)e.addRule(t[n][0],t[n][1],0)},r.dom.add_styles=N,N.apply(this,arguments)};r.dom.add_style=function(e){return r.dom.add_styles.call(this,[e])},r.dom.add_styles=N,r.dom.smart_disable=function(e,t,n){e=i.get(e);var r;typeof t=="undefined"&&(t=!e.disabled);if(t){if(e._smart_disable_overlay)return e._smart_disable_overlay;e.disabled=!0,r=new k(e),r.render(e.parentNode),r.show(),r.element.onclick=function(){r.destroy();try{delete e._smart_disable_overlay}catch(t){e._smart_disable_overlay=undefined}e.disabled=!1,n&&n.apply(e)},e._smart_disable_overlay=r}else{e.disabled=!1,r=e._smart_disable_overlay;try{delete e._smart_disable_overlay}catch(s){e._smart_disable_overlay=undefined}r&&r.destroy()}return r};var C=!!n.env.ua.ie,k=function(e){C&&(r.dom.add_style([".cjt-smart-disable","background-color:red;filter:alpha(opacity=0);opacity:0;"]),C=!1);var t=parseFloat(r.dom.get_zindex(e));k.superclass.constructor.call(this,i.generateId(),{iframe:!1,zIndex:t+1,width:e.offsetWidth+"px",height:e.offsetHeight+"px",context:[e,"tl","tl"]}),this.showEvent.subscribe(this.hideMacGeckoScrollbars,this,!0),this.hideMacGeckoScrollbars=this.showMacGeckoScrollbars,i.addClass(this.element,"cjt-smart-disable"),this._context_el=e};n.lang.extend(k,n.widget.Overlay,{align:function(){var e=parseFloat(r.dom.get_zindex(this._context_el));this.cfg.setProperty("zIndex",e+1),this.cfg.setProperty("width",this._context_el.offsetWidth+"px"),this.cfg.setProperty("height",this._context_el.offsetHeight+"px"),k.superclass.align.apply(this,arguments)},showMacGeckoScrollbars:function(){}}),r.dom.Smart_Disable_Overlay=k,r.dom.get_recursive_style=function(e,n,r,s){var o=i.get(e),u;do u=i.getComputedStyle(o,n);while(u===r&&(o=o.parentNode)&&o!==t);if(!o||u===r)u=s;return u},r.dom.get_background_color=function(e){return r.dom.get_recursive_style(e,"backgroundColor","transparent")},r.dom.get_zindex=function(e){return r.dom.get_recursive_style(e,"zIndex","auto",0)},r.ajax.Grouped_Input_Set=function(){var e,t=arguments[0];typeof t=="string"||t.tagName&&t.tagName.toLowerCase()==="form"?e=r.ajax.Grouped_Input_Set.make_groups_from_form.apply(this,arguments):e=t,this._groups=e;var i=this,o=function(e){s.on(e.listeners,"click",function(){e.radio.checked||(e.radio.checked=!0,i.refresh())})};for(var u=0,a=e.length;u<a;u++){var f=e[u];n.util.Event.on(f.radio,"click",this.refresh,this,!0),f.listeners&&o(f)}this.refresh()};var L={button:1,input:1,select:1,textarea:1};r.ajax.Grouped_Input_Set.make_groups_from_form=function(e,t,n){e=i.get(e);var s=r.Y(e).all("label[for]"),o={},u;for(var a=s.length-1;a>=0;a--)u=s[a],o[u.htmlFor]=u;var f=i.getElementsBy(function(e){return e.tagName.toLowerCase()in L},undefined,e),l,c;if(typeof t!="undefined"&&typeof t!="number"){typeof t=="string"&&(t=i.get(t));if(t){c=0;while((l=f[c])&&l!==t)c++;if(!l)return;t=c}}t||(t=0);if(typeof n!="undefined"&&typeof n!="number"){typeof n=="string"&&(n=i.get(n));if(n){c=t||0,c++;while((l=f[c])&&l!==n)c++;if(!l)return;n=c}}var h=[],p;for(var d=t;(l=f[d])&&l;d++){if(n&&d>n)break;if(l.type&&l.type.toLowerCase()==="radio")p&&h.push(p),p={radio:l,inputs:[],listeners:[]};else if(p){p.inputs.push(l);var v=i.getAncestorByTagName(l,"label");!v&&l.id&&(v=o[l.id]),v&&p.listeners.indexOf(v)===-1&&p.listeners.push(v)}}return p&&h.push(p),h},n.lang.augmentObject(r.ajax.Grouped_Input_Set.prototype,{_groups:null,get_groups:function(){return this._groups&&this._groups.slice(0)},refresh:function(){var e;for(var t=0;t<this._groups.length;t++){var n=this._groups[t];n.radio.checked?(e=n,this._enable_group(n)):this._disable_group(n)}this.onrefresh&&this.onrefresh.call(this,e)},align:function(){var e=function(e){e.align()};this.get_groups().forEach(function(t){t.disabled&&t.smart_disable_overlays.forEach(e)})},onrefresh:null,_enable_group:function(e){if(e.inputs)for(var t=0;t<e.inputs.length;t++)r.dom.smart_disable(e.inputs[t],!1);if(e.noninputs)for(var n=0;n<e.noninputs.length;n++)i.removeClass(e.noninputs[n],"disabled");e.disabled=!1,e.smart_disable_overlays=null},_disable_group:function(e){var n=this;e.disabled=!0,e.smart_disable_overlays=[];if(e.inputs){var s=function(){e.radio.checked=!0,n.refresh(),this.focus();if("selectionStart"in this)this.selectionStart=this.selectionEnd=this.value.length;else if(t.selection){var r=t.selection.createRange();r.moveStart("character",this.value.length)}};for(var o=0;o<e.inputs.length;o++){var u=r.dom.smart_disable(e.inputs[o],!0,s);e.smart_disable_overlays.push(u)}}if(e.noninputs)for(var a=0;a<e.noninputs.length;a++)i.addClass(e.noninputs[a],"disabled")}});var A=function(){A.superclass.constructor.apply(this,arguments)};A.DEFAULT_CONTAINER_ID="cjt_dynamicnotice_container",A.CLASS="cjt-dynamicnotice",n.lang.extend(A,r.widgets.Notice,{reset_fade_timeout:function(){this.config_fade_delay(this.cfg.getProperty("fade_delay"))},init:function(e,t){A.superclass.init.call(this,e),this.beforeInitEvent.fire(A),i.addClass(this.element,A.CLASS),t&&(this.cfg.applyConfig(t,!0),this.render()),this.initEvent.fire(A)},initDefaultConfig:function(){A.superclass.initDefaultConfig.call(this),this.cfg.addProperty("closable",{value:!0,handler:this.config_closable}),this.cfg.addProperty("closable_tooltip",{value:o.maketext("Click to close.")}),this.cfg.addProperty("fade_delay",{value:5,handler:this.config_fade_delay})},config_closable:function(e,t,r){if(!this.body){var o=arguments;this.beforeShowEvent.subscribe(function f(){this.beforeShowEvent.unsubscribe(f),this.config_closable.apply(this,o)});return}var u=t[0],a=this.cfg.getProperty("closable_tooltip");u?(i.addClass(this.element,"cjt-notice-closable"),this._click_listener=s.on(this.body,"mousedown",function(e){var t=s.getTarget(e);n.widget.Panel.FOCUSABLE.indexOf(t.tagName.toLowerCase())===-1&&this.fade_out()},this,!0),a&&(this._former_tooltip=this.body.title,this.body.title=a)):(i.removeClass(this.element,"cjt-notice-closable"),this._click_listener&&(s.removeListener(this.body,"mousedown",this._click_listener),delete this._click_listener),a&&this.body.title===a&&"_former_tooltip"in this&&(this.body.title=this._former_tooltip,delete this._former_tooltip))},config_fade_delay:function(t,n){this._cancel_fade();var r=n[0];if(r){var i=this;this._fade_timeout=e.setTimeout(function(){i.fade_out()},r*1e3)}},destroy:function(){this._fade_timeout&&(e.clearTimeout(this._fade_timeout),delete this._fade_timeout),this.cfg&&A.superclass.destroy.apply(this,arguments)},_cancel_fade:function(){this._fade_timeout&&(e.clearTimeout(this._fade_timeout),delete this._fade_timeout)},render:function(){if(!A.notice_container){var e=t.createElement("div");e.id="cjt_dynamicnotice_container",t.body.appendChild(e),A.notice_container=e,i.addClass(e,"cjt-dynamicnotice-container")}var n=this.cfg.getProperty("container");n?i.addClass(n,"cjt-dynamicnotice-container"):n=A.notice_container;var r=A.superclass.render.call(this,n);return r}}),r.ajax.Dynamic_Notice=A;var O=function(e,t,s,u){u||(u={}),n.lang.augmentObject(u,O.standardOptions),u.context||(u.context=[e,u.overlayCorner?u.overlayCorner:"tl",u.contextCorner?u.contextCorner:"tr",["beforeShow","windowResize"],[u.offsetX?u.offsetX:10,u.offsetY?u.offsetY:-5]]),s||(s=i.generateId());var a=new r.ajax.Common_Dialog(s,u),f=e.title,l=f.html_encode().replace(/\n/g,"<br>");if(u.format){var c=u.format;c.highlightClassName=c.highlightClassName||O.DEFAULT_TOOLTIP_HIGHLIGHT_CLASS_NAME;if(c.processText)try{l=c.processText(l,c.highlightWords,c.highlightClassName)}catch(h){}else if(c.highlightWords&&c.highlightWords.length){var p="<span class='{class}'>{word}</span>".replace("{class}",c.highlightClassName);for(var d=0,v=c.highlightWords.length;d<v;d++){var m=c.highlightWords[d];try{l=l.replace(m,p.replace("{word}",m))}catch(h){}}}}a.setBody(l),a.restoreTitle=f,e.title="";var g=t?t:o.maketext("Notice");g=r.widgets.Dialog.applyDialogHeader(g),a.setHeader(g),a.cfg.getProperty("buttons")[0].text=o.maketext("OK"),a.submit=function(){this.hide(),this.restoreTitle&&(e.title=this.restoreTitle),delete O.active[e.id]},this.close=function(){a.submit()},a.cfg.getProperty("buttons").pop(),i.addClass(a.element,"cjt_notice_dialog cjt_info_dialog"),a.beforeShowEvent.subscribe(a.center,a,!0),a.show_from_source(e)};O.standardOptions={modal:!1,width:"300px",fixedcenter:!1},O.DEFAULT_TOOLTIP_HIGHLIGHT_CLASS_NAME="cjt-highlight-word",O.toggleToolTip=function(e,t,n,r){e.id||(e.id=i.generateId());if(!O.active[e.id]){var s=new O(e,t,n,r);O.active[e.id]=s}else O.active[e.id].close()},O.active=[],r.ajax.toggleToolTip=O.toggleToolTip})(window);