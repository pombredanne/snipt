define("ace/keyboard/keybinding/vim",["require","exports","module","ace/keyboard/state_handler"],function(a,b,c){"use strict";var d=a("../state_handler").StateHandler,e=a("../state_handler").matchCharacterOnly,f=function(a,b,c){return{regex:["([0-9]*)",a],exec:b,params:[{name:"times",match:1,type:"number",defaultValue:1}],then:c}},g={start:[{key:"i",then:"insertMode"},{key:"d",then:"deleteMode"},{key:"a",exec:"gotoright",then:"insertMode"},{key:"shift-i",exec:"gotolinestart",then:"insertMode"},{key:"shift-a",exec:"gotolineend",then:"insertMode"},{key:"shift-c",exec:"removetolineend",then:"insertMode"},{key:"shift-r",exec:"overwrite",then:"replaceMode"},f("(k|up)","golineup"),f("(j|down)","golinedown"),f("(l|right)","gotoright"),f("(h|left)","gotoleft"),{key:"shift-g",exec:"gotoend"},f("b","gotowordleft"),f("e","gotowordright"),f("x","del"),f("shift-x","backspace"),f("shift-d","removetolineend"),f("u","undo"),{comment:"Catch some keyboard input to stop it here",match:e}],insertMode:[{key:"esc",then:"start"}],replaceMode:[{key:"esc",exec:"overwrite",then:"start"}],deleteMode:[{key:"d",exec:"removeline",then:"start"}]};b.Vim=new d(g)}),define("ace/keyboard/state_handler",["require","exports","module"],function(a,b,c){function e(a){this.keymapping=this.$buildKeymappingRegex(a)}"use strict";var d=!1;e.prototype={$buildKeymappingRegex:function(a){for(var b in a)this.$buildBindingsRegex(a[b]);return a},$buildBindingsRegex:function(a){a.forEach(function(a){a.key?a.key=new RegExp("^"+a.key+"$"):Array.isArray(a.regex)?("key"in a||(a.key=new RegExp("^"+a.regex[1]+"$")),a.regex=new RegExp(a.regex.join("")+"$")):a.regex&&(a.regex=new RegExp(a.regex+"$"))})},$composeBuffer:function(a,b,c,d){if(a.state==null||a.buffer==null)a.state="start",a.buffer="";var e=[];b&1&&e.push("ctrl"),b&8&&e.push("command"),b&2&&e.push("option"),b&4&&e.push("shift"),c&&e.push(c);var f=e.join("-"),g=a.buffer+f;b!=2&&(a.buffer=g);var h={bufferToUse:g,symbolicName:f};return d&&(h.keyIdentifier=d.keyIdentifier),h},$find:function(a,b,c,e,f,g){var h={};return this.keymapping[a.state].some(function(i){var j;if(i.key&&!i.key.test(c))return!1;if(i.regex&&!(j=i.regex.exec(b)))return!1;if(i.match&&!i.match(b,e,f,c,g))return!1;if(i.disallowMatches)for(var k=0;k<i.disallowMatches.length;k++)if(!!j[i.disallowMatches[k]])return!1;if(i.exec){h.command=i.exec;if(i.params){var l;h.args={},i.params.forEach(function(a){a.match!=null&&j!=null?l=j[a.match]||a.defaultValue:l=a.defaultValue,a.type==="number"&&(l=parseInt(l)),h.args[a.name]=l})}a.buffer=""}return i.then&&(a.state=i.then,a.buffer=""),h.command==null&&(h.command="null"),d&&console.log("KeyboardStateMapper#find",i),!0}),h.command?h:(a.buffer="",!1)},handleKeyboard:function(a,b,c,e,f){if(b==0||c!=""&&c!=String.fromCharCode(0)){var g=this.$composeBuffer(a,b,c,f),h=g.bufferToUse,i=g.symbolicName,j=g.keyIdentifier;return g=this.$find(a,h,i,b,c,j),d&&console.log("KeyboardStateMapper#match",h,i,g),g}return null}},b.matchCharacterOnly=function(a,b,c,d){return b==0?!0:b==4&&c.length==1?!0:!1},b.StateHandler=e})