/*! For license information please see bundle.js.LICENSE.txt */
(()=>{var t={167:(t,e,s)=>{"use strict";s.r(e),s.d(e,{BISHOP:()=>a,BLACK:()=>i,Chess:()=>$,DEFAULT_POSITION:()=>u,KING:()=>c,KNIGHT:()=>n,PAWN:()=>o,QUEEN:()=>l,ROOK:()=>h,SQUARES:()=>p,WHITE:()=>r,validateFen:()=>R});const r="w",i="b",o="p",n="n",a="b",h="r",l="q",c="k",u="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",_=-1,f={NORMAL:"n",CAPTURE:"c",BIG_PAWN:"b",EP_CAPTURE:"e",PROMOTION:"p",KSIDE_CASTLE:"k",QSIDE_CASTLE:"q"},p=["a8","b8","c8","d8","e8","f8","g8","h8","a7","b7","c7","d7","e7","f7","g7","h7","a6","b6","c6","d6","e6","f6","g6","h6","a5","b5","c5","d5","e5","f5","g5","h5","a4","b4","c4","d4","e4","f4","g4","h4","a3","b3","c3","d3","e3","f3","g3","h3","a2","b2","c2","d2","e2","f2","g2","h2","a1","b1","c1","d1","e1","f1","g1","h1"],d={NORMAL:1,CAPTURE:2,BIG_PAWN:4,EP_CAPTURE:8,PROMOTION:16,KSIDE_CASTLE:32,QSIDE_CASTLE:64},m={a8:0,b8:1,c8:2,d8:3,e8:4,f8:5,g8:6,h8:7,a7:16,b7:17,c7:18,d7:19,e7:20,f7:21,g7:22,h7:23,a6:32,b6:33,c6:34,d6:35,e6:36,f6:37,g6:38,h6:39,a5:48,b5:49,c5:50,d5:51,e5:52,f5:53,g5:54,h5:55,a4:64,b4:65,c4:66,d4:67,e4:68,f4:69,g4:70,h4:71,a3:80,b3:81,c3:82,d3:83,e3:84,f3:85,g3:86,h3:87,a2:96,b2:97,c2:98,d2:99,e2:100,f2:101,g2:102,h2:103,a1:112,b1:113,c1:114,d1:115,e1:116,f1:117,g1:118,h1:119},g={b:[16,32,17,15],w:[-16,-32,-17,-15]},b={n:[-18,-33,-31,-14,18,33,31,14],b:[-17,-15,17,15],r:[-16,1,16,-1],q:[-17,-16,-15,1,17,16,15,-1],k:[-17,-16,-15,1,17,16,15,-1]},v=[20,0,0,0,0,0,0,24,0,0,0,0,0,0,20,0,0,20,0,0,0,0,0,24,0,0,0,0,0,20,0,0,0,0,20,0,0,0,0,24,0,0,0,0,20,0,0,0,0,0,0,20,0,0,0,24,0,0,0,20,0,0,0,0,0,0,0,0,20,0,0,24,0,0,20,0,0,0,0,0,0,0,0,0,0,20,2,24,2,20,0,0,0,0,0,0,0,0,0,0,0,2,53,56,53,2,0,0,0,0,0,0,24,24,24,24,24,24,56,0,56,24,24,24,24,24,24,0,0,0,0,0,0,2,53,56,53,2,0,0,0,0,0,0,0,0,0,0,0,20,2,24,2,20,0,0,0,0,0,0,0,0,0,0,20,0,0,24,0,0,20,0,0,0,0,0,0,0,0,20,0,0,0,24,0,0,0,20,0,0,0,0,0,0,20,0,0,0,0,24,0,0,0,0,20,0,0,0,0,20,0,0,0,0,0,24,0,0,0,0,0,20,0,0,20,0,0,0,0,0,0,24,0,0,0,0,0,0,20],k=[17,0,0,0,0,0,0,16,0,0,0,0,0,0,15,0,0,17,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,17,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,0,17,0,0,0,16,0,0,0,15,0,0,0,0,0,0,0,0,17,0,0,16,0,0,15,0,0,0,0,0,0,0,0,0,0,17,0,16,0,15,0,0,0,0,0,0,0,0,0,0,0,0,17,16,15,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,0,0,-15,-16,-17,0,0,0,0,0,0,0,0,0,0,0,0,-15,0,-16,0,-17,0,0,0,0,0,0,0,0,0,0,-15,0,0,-16,0,0,-17,0,0,0,0,0,0,0,0,-15,0,0,0,-16,0,0,0,-17,0,0,0,0,0,0,-15,0,0,0,0,-16,0,0,0,0,-17,0,0,0,0,-15,0,0,0,0,0,-16,0,0,0,0,0,-17,0,0,-15,0,0,0,0,0,0,-16,0,0,0,0,0,0,-17],E={p:1,n:2,b:4,r:8,q:16,k:32},S=[n,a,h,l],C={[c]:d.KSIDE_CASTLE,[l]:d.QSIDE_CASTLE},I={w:[{square:m.a1,flag:d.QSIDE_CASTLE},{square:m.h1,flag:d.KSIDE_CASTLE}],b:[{square:m.a8,flag:d.QSIDE_CASTLE},{square:m.h8,flag:d.KSIDE_CASTLE}]},y={b:1,w:6},A=["1-0","0-1","1/2-1/2","*"];function w(t){return t>>4}function N(t){return 15&t}function T(t){return-1!=="0123456789".indexOf(t)}function q(t){const e=N(t),s=w(t);return"abcdefgh".substring(e,e+1)+"87654321".substring(s,s+1)}function P(t){return t===r?i:r}function R(t){const e=t.split(/\s+/);if(6!==e.length)return{ok:!1,error:"Invalid FEN: must contain six space-delimited fields"};const s=parseInt(e[5],10);if(isNaN(s)||s<=0)return{ok:!1,error:"Invalid FEN: move number must be a positive integer"};const r=parseInt(e[4],10);if(isNaN(r)||r<0)return{ok:!1,error:"Invalid FEN: half move counter number must be a non-negative integer"};if(!/^(-|[abcdefgh][36])$/.test(e[3]))return{ok:!1,error:"Invalid FEN: en-passant square is invalid"};if(/[^kKqQ-]/.test(e[2]))return{ok:!1,error:"Invalid FEN: castling availability is invalid"};if(!/^(w|b)$/.test(e[1]))return{ok:!1,error:"Invalid FEN: side-to-move is invalid"};const i=e[0].split("/");if(8!==i.length)return{ok:!1,error:"Invalid FEN: piece data does not contain 8 '/'-delimited rows"};for(let t=0;t<i.length;t++){let e=0,s=!1;for(let r=0;r<i[t].length;r++)if(T(i[t][r])){if(s)return{ok:!1,error:"Invalid FEN: piece data is invalid (consecutive number)"};e+=parseInt(i[t][r],10),s=!0}else{if(!/^[prnbqkPRNBQK]$/.test(i[t][r]))return{ok:!1,error:"Invalid FEN: piece data is invalid (invalid piece)"};e+=1,s=!1}if(8!==e)return{ok:!1,error:"Invalid FEN: piece data is invalid (too many squares in rank)"}}if("3"==e[3][1]&&"w"==e[1]||"6"==e[3][1]&&"b"==e[1])return{ok:!1,error:"Invalid FEN: illegal en-passant square"};const o=[{color:"white",regex:/K/g},{color:"black",regex:/k/g}];for(const{color:t,regex:s}of o){if(!s.test(e[0]))return{ok:!1,error:`Invalid FEN: missing ${t} king`};if((e[0].match(s)||[]).length>1)return{ok:!1,error:`Invalid FEN: too many ${t} kings`}}return Array.from(i[0]+i[7]).some((t=>"P"===t.toUpperCase()))?{ok:!1,error:"Invalid FEN: some pawns are on the edge rows"}:{ok:!0}}function L(t,e,s,r,i,n=void 0,a=d.NORMAL){const h=w(r);if(i!==o||7!==h&&0!==h)t.push({color:e,from:s,to:r,piece:i,captured:n,flags:a});else for(let o=0;o<S.length;o++){const h=S[o];t.push({color:e,from:s,to:r,piece:i,captured:n,promotion:h,flags:a|d.PROMOTION})}}function M(t){let e=t.charAt(0);if(e>="a"&&e<="h"){if(t.match(/[a-h]\d.*[a-h]\d/))return;return o}return e=e.toLowerCase(),"o"===e?c:e}function O(t){return t.replace(/=/,"").replace(/[+#]?[?!]*$/,"")}function D(t){return t.split(" ").slice(0,4).join(" ")}class ${_board=new Array(128);_turn=r;_header={};_kings={w:_,b:_};_epSquare=-1;_halfMoves=0;_moveNumber=0;_history=[];_comments={};_castling={w:0,b:0};_positionCounts={};constructor(t=u){this.load(t)}clear({preserveHeaders:t=!1}={}){this._board=new Array(128),this._kings={w:_,b:_},this._turn=r,this._castling={w:0,b:0},this._epSquare=_,this._halfMoves=0,this._moveNumber=1,this._history=[],this._comments={},this._header=t?this._header:{},delete this._header.SetUp,delete this._header.FEN,this._positionCounts=new Proxy({},{get:(t,e)=>"length"===e?Object.keys(t).length:t?.[D(e)]||0,set:(t,e,s)=>{const r=D(e);return 0===s?delete t[r]:t[r]=s,!0}})}removeHeader(t){t in this._header&&delete this._header[t]}load(t,{skipValidation:e=!1,preserveHeaders:s=!1}={}){let o=t.split(/\s+/);if(o.length>=2&&o.length<6){const e=["-","-","0","1"];t=o.concat(e.slice(-(6-o.length))).join(" ")}if(o=t.split(/\s+/),!e){const{ok:e,error:s}=R(t);if(!e)throw new Error(s)}const n=o[0];let a=0;this.clear({preserveHeaders:s});for(let t=0;t<n.length;t++){const e=n.charAt(t);if("/"===e)a+=8;else if(T(e))a+=parseInt(e,10);else{const t=e<"a"?r:i;this._put({type:e.toLowerCase(),color:t},q(a)),a++}}this._turn=o[1],o[2].indexOf("K")>-1&&(this._castling.w|=d.KSIDE_CASTLE),o[2].indexOf("Q")>-1&&(this._castling.w|=d.QSIDE_CASTLE),o[2].indexOf("k")>-1&&(this._castling.b|=d.KSIDE_CASTLE),o[2].indexOf("q")>-1&&(this._castling.b|=d.QSIDE_CASTLE),this._epSquare="-"===o[3]?_:m[o[3]],this._halfMoves=parseInt(o[4],10),this._moveNumber=parseInt(o[5],10),this._updateSetup(t),this._positionCounts[t]++}fen(){let t=0,e="";for(let s=m.a8;s<=m.h1;s++){if(this._board[s]){t>0&&(e+=t,t=0);const{color:i,type:o}=this._board[s];e+=i===r?o.toUpperCase():o.toLowerCase()}else t++;s+1&136&&(t>0&&(e+=t),s!==m.h1&&(e+="/"),t=0,s+=8)}let s="";this._castling[r]&d.KSIDE_CASTLE&&(s+="K"),this._castling[r]&d.QSIDE_CASTLE&&(s+="Q"),this._castling[i]&d.KSIDE_CASTLE&&(s+="k"),this._castling[i]&d.QSIDE_CASTLE&&(s+="q"),s=s||"-";let n="-";if(this._epSquare!==_){const t=this._epSquare+(this._turn===r?16:-16),e=[t+1,t-1];for(const t of e){if(136&t)continue;const e=this._turn;if(this._board[t]?.color===e&&this._board[t]?.type===o){this._makeMove({color:e,from:t,to:this._epSquare,piece:o,captured:o,flags:d.EP_CAPTURE});const s=!this._isKingAttacked(e);if(this._undoMove(),s){n=q(this._epSquare);break}}}}return[e,this._turn,s,n,this._halfMoves,this._moveNumber].join(" ")}_updateSetup(t){this._history.length>0||(t!==u?(this._header.SetUp="1",this._header.FEN=t):(delete this._header.SetUp,delete this._header.FEN))}reset(){this.load(u)}get(t){return this._board[m[t]]||!1}put({type:t,color:e},s){return!!this._put({type:t,color:e},s)&&(this._updateCastlingRights(),this._updateEnPassantSquare(),this._updateSetup(this.fen()),!0)}_put({type:t,color:e},s){if(-1==="pnbrqkPNBRQK".indexOf(t.toLowerCase()))return!1;if(!(s in m))return!1;const r=m[s];if(t==c&&this._kings[e]!=_&&this._kings[e]!=r)return!1;const i=this._board[r];return i&&i.type===c&&(this._kings[i.color]=_),this._board[r]={type:t,color:e},t===c&&(this._kings[e]=r),!0}remove(t){const e=this.get(t);return delete this._board[m[t]],e&&e.type===c&&(this._kings[e.color]=_),this._updateCastlingRights(),this._updateEnPassantSquare(),this._updateSetup(this.fen()),e}_updateCastlingRights(){const t=this._board[m.e1]?.type===c&&this._board[m.e1]?.color===r,e=this._board[m.e8]?.type===c&&this._board[m.e8]?.color===i;t&&this._board[m.a1]?.type===h&&this._board[m.a1]?.color===r||(this._castling.w&=~d.QSIDE_CASTLE),t&&this._board[m.h1]?.type===h&&this._board[m.h1]?.color===r||(this._castling.w&=~d.KSIDE_CASTLE),e&&this._board[m.a8]?.type===h&&this._board[m.a8]?.color===i||(this._castling.b&=~d.QSIDE_CASTLE),e&&this._board[m.h8]?.type===h&&this._board[m.h8]?.color===i||(this._castling.b&=~d.KSIDE_CASTLE)}_updateEnPassantSquare(){if(this._epSquare===_)return;const t=this._epSquare+(this._turn===r?-16:16),e=this._epSquare+(this._turn===r?16:-16),s=[e+1,e-1];null===this._board[t]&&null===this._board[this._epSquare]&&this._board[e]?.color===P(this._turn)&&this._board[e]?.type===o&&s.some((t=>!(136&t)&&this._board[t]?.color===this._turn&&this._board[t]?.type===o))||(this._epSquare=_)}_attacked(t,e){for(let s=m.a8;s<=m.h1;s++){if(136&s){s+=7;continue}if(void 0===this._board[s]||this._board[s].color!==t)continue;const n=this._board[s],a=s-e;if(0===a)continue;const h=a+119;if(v[h]&E[n.type]){if(n.type===o){if(a>0){if(n.color===r)return!0}else if(n.color===i)return!0;continue}if("n"===n.type||"k"===n.type)return!0;const t=k[h];let l=s+t,c=!1;for(;l!==e;){if(null!=this._board[l]){c=!0;break}l+=t}if(!c)return!0}}return!1}_isKingAttacked(t){const e=this._kings[t];return-1!==e&&this._attacked(P(t),e)}isAttacked(t,e){return this._attacked(e,m[t])}isCheck(){return this._isKingAttacked(this._turn)}inCheck(){return this.isCheck()}isCheckmate(){return this.isCheck()&&0===this._moves().length}isStalemate(){return!this.isCheck()&&0===this._moves().length}isInsufficientMaterial(){const t={b:0,n:0,r:0,q:0,k:0,p:0},e=[];let s=0,r=0;for(let i=m.a8;i<=m.h1;i++){if(r=(r+1)%2,136&i){i+=7;continue}const o=this._board[i];o&&(t[o.type]=o.type in t?t[o.type]+1:1,o.type===a&&e.push(r),s++)}if(2===s)return!0;if(3===s&&(1===t[a]||1===t[n]))return!0;if(s===t[a]+2){let t=0;const s=e.length;for(let r=0;r<s;r++)t+=e[r];if(0===t||t===s)return!0}return!1}_getRepetitionCount(){return this._positionCounts[this.fen()]}isThreefoldRepetition(){return this._getRepetitionCount()>=3}isDraw(){return this._halfMoves>=100||this.isStalemate()||this.isInsufficientMaterial()||this.isThreefoldRepetition()}isGameOver(){return this.isCheckmate()||this.isStalemate()||this.isDraw()}moves({verbose:t=!1,square:e,piece:s}={}){const r=this._moves({square:e,piece:s});return t?r.map((t=>this._makePretty(t))):r.map((t=>this._moveToSan(t,r)))}_moves({legal:t=!0,piece:e,square:s}={}){const r=s?s.toLowerCase():void 0,i=e?.toLowerCase(),a=[],h=this._turn,l=P(h);let u=m.a8,_=m.h1,f=!1;if(r){if(!(r in m))return[];u=_=m[r],f=!0}for(let t=u;t<=_;t++){if(136&t){t+=7;continue}if(!this._board[t]||this._board[t].color===l)continue;const{type:e}=this._board[t];let s;if(e===o){if(i&&i!==e)continue;s=t+g[h][0],this._board[s]||(L(a,h,t,s,o),s=t+g[h][1],y[h]!==w(t)||this._board[s]||L(a,h,t,s,o,void 0,d.BIG_PAWN));for(let e=2;e<4;e++)s=t+g[h][e],136&s||(this._board[s]?.color===l?L(a,h,t,s,o,this._board[s].type,d.CAPTURE):s===this._epSquare&&L(a,h,t,s,o,o,d.EP_CAPTURE))}else{if(i&&i!==e)continue;for(let r=0,i=b[e].length;r<i;r++){const i=b[e][r];for(s=t;s+=i,!(136&s);){if(this._board[s]){if(this._board[s].color===h)break;L(a,h,t,s,e,this._board[s].type,d.CAPTURE);break}if(L(a,h,t,s,e),e===n||e===c)break}}}}if(!(void 0!==i&&i!==c||f&&_!==this._kings[h])){if(this._castling[h]&d.KSIDE_CASTLE){const t=this._kings[h],e=t+2;this._board[t+1]||this._board[e]||this._attacked(l,this._kings[h])||this._attacked(l,t+1)||this._attacked(l,e)||L(a,h,this._kings[h],e,c,void 0,d.KSIDE_CASTLE)}if(this._castling[h]&d.QSIDE_CASTLE){const t=this._kings[h],e=t-2;this._board[t-1]||this._board[t-2]||this._board[t-3]||this._attacked(l,this._kings[h])||this._attacked(l,t-1)||this._attacked(l,e)||L(a,h,this._kings[h],e,c,void 0,d.QSIDE_CASTLE)}}if(!t||-1===this._kings[h])return a;const p=[];for(let t=0,e=a.length;t<e;t++)this._makeMove(a[t]),this._isKingAttacked(h)||p.push(a[t]),this._undoMove();return p}move(t,{strict:e=!1}={}){let s=null;if("string"==typeof t)s=this._moveFromSan(t,e);else if("object"==typeof t){const e=this._moves();for(let r=0,i=e.length;r<i;r++)if(t.from===q(e[r].from)&&t.to===q(e[r].to)&&(!("promotion"in e[r])||t.promotion===e[r].promotion)){s=e[r];break}}if(!s)throw"string"==typeof t?new Error(`Invalid move: ${t}`):new Error(`Invalid move: ${JSON.stringify(t)}`);const r=this._makePretty(s);return this._makeMove(s),this._positionCounts[r.after]++,r}_push(t){this._history.push({move:t,kings:{b:this._kings.b,w:this._kings.w},turn:this._turn,castling:{b:this._castling.b,w:this._castling.w},epSquare:this._epSquare,halfMoves:this._halfMoves,moveNumber:this._moveNumber})}_makeMove(t){const e=this._turn,s=P(e);if(this._push(t),this._board[t.to]=this._board[t.from],delete this._board[t.from],t.flags&d.EP_CAPTURE&&(this._turn===i?delete this._board[t.to-16]:delete this._board[t.to+16]),t.promotion&&(this._board[t.to]={type:t.promotion,color:e}),this._board[t.to].type===c){if(this._kings[e]=t.to,t.flags&d.KSIDE_CASTLE){const e=t.to-1,s=t.to+1;this._board[e]=this._board[s],delete this._board[s]}else if(t.flags&d.QSIDE_CASTLE){const e=t.to+1,s=t.to-2;this._board[e]=this._board[s],delete this._board[s]}this._castling[e]=0}if(this._castling[e])for(let s=0,r=I[e].length;s<r;s++)if(t.from===I[e][s].square&&this._castling[e]&I[e][s].flag){this._castling[e]^=I[e][s].flag;break}if(this._castling[s])for(let e=0,r=I[s].length;e<r;e++)if(t.to===I[s][e].square&&this._castling[s]&I[s][e].flag){this._castling[s]^=I[s][e].flag;break}t.flags&d.BIG_PAWN?this._epSquare=e===i?t.to-16:t.to+16:this._epSquare=_,t.piece===o||t.flags&(d.CAPTURE|d.EP_CAPTURE)?this._halfMoves=0:this._halfMoves++,e===i&&this._moveNumber++,this._turn=s}undo(){const t=this._undoMove();if(t){const e=this._makePretty(t);return this._positionCounts[e.after]--,e}return null}_undoMove(){const t=this._history.pop();if(void 0===t)return null;const e=t.move;this._kings=t.kings,this._turn=t.turn,this._castling=t.castling,this._epSquare=t.epSquare,this._halfMoves=t.halfMoves,this._moveNumber=t.moveNumber;const s=this._turn,r=P(s);if(this._board[e.from]=this._board[e.to],this._board[e.from].type=e.piece,delete this._board[e.to],e.captured)if(e.flags&d.EP_CAPTURE){let t;t=s===i?e.to-16:e.to+16,this._board[t]={type:o,color:r}}else this._board[e.to]={type:e.captured,color:r};if(e.flags&(d.KSIDE_CASTLE|d.QSIDE_CASTLE)){let t,s;e.flags&d.KSIDE_CASTLE?(t=e.to+1,s=e.to-1):(t=e.to-2,s=e.to+1),this._board[t]=this._board[s],delete this._board[s]}return e}pgn({newline:t="\n",maxWidth:e=0}={}){const s=[];let r=!1;for(const e in this._header)s.push("["+e+' "'+this._header[e]+'"]'+t),r=!0;r&&this._history.length&&s.push(t);const i=t=>{const e=this._comments[this.fen()];return void 0!==e&&(t=`${t}${t.length>0?" ":""}{${e}}`),t},o=[];for(;this._history.length>0;)o.push(this._undoMove());const n=[];let a="";for(0===o.length&&n.push(i(""));o.length>0;){a=i(a);const t=o.pop();if(!t)break;if(this._history.length||"b"!==t.color)"w"===t.color&&(a.length&&n.push(a),a=this._moveNumber+".");else{const t=`${this._moveNumber}. ...`;a=a?`${a} ${t}`:t}a=a+" "+this._moveToSan(t,this._moves({legal:!0})),this._makeMove(t)}if(a.length&&n.push(i(a)),void 0!==this._header.Result&&n.push(this._header.Result),0===e)return s.join("")+n.join(" ");const h=function(){return s.length>0&&" "===s[s.length-1]&&(s.pop(),!0)},l=function(r,i){for(const o of i.split(" "))if(o){if(r+o.length>e){for(;h();)r--;s.push(t),r=0}s.push(o),r+=o.length,s.push(" "),r++}return h()&&r--,r};let c=0;for(let r=0;r<n.length;r++)c+n[r].length>e&&n[r].includes("{")?c=l(c,n[r]):(c+n[r].length>e&&0!==r?(" "===s[s.length-1]&&s.pop(),s.push(t),c=0):0!==r&&(s.push(" "),c++),s.push(n[r]),c+=n[r].length);return s.join("")}header(...t){for(let e=0;e<t.length;e+=2)"string"==typeof t[e]&&"string"==typeof t[e+1]&&(this._header[t[e]]=t[e+1]);return this._header}loadPgn(t,{strict:e=!1,newlineChar:s="\r?\n"}={}){function r(t){return t.replace(/\\/g,"\\")}t=t.trim();const i=new RegExp("^(\\[((?:"+r(s)+")|.)*\\])((?:\\s*"+r(s)+"){2}|(?:\\s*"+r(s)+")*$)").exec(t),o=i&&i.length>=2?i[1]:"";this.reset();const n=function(t){const e={},i=t.split(new RegExp(r(s)));let o="",n="";for(let t=0;t<i.length;t++){const s=/^\s*\[\s*([A-Za-z]+)\s*"(.*)"\s*\]\s*$/;o=i[t].replace(s,"$1"),n=i[t].replace(s,"$2"),o.trim().length>0&&(e[o]=n)}return e}(o);let a="";for(const t in n)"fen"===t.toLowerCase()&&(a=n[t]),this.header(t,n[t]);if(e){if("1"===n.SetUp){if(!("FEN"in n))throw new Error("Invalid PGN: FEN tag must be supplied with SetUp tag");this.load(n.FEN,{preserveHeaders:!0})}}else a&&this.load(a,{preserveHeaders:!0});const h=function(t){return`{${function(t){return Array.from(t).map((function(t){return t.charCodeAt(0)<128?t.charCodeAt(0).toString(16):encodeURIComponent(t).replace(/%/g,"").toLowerCase()})).join("")}((t=t.replace(new RegExp(r(s),"g")," ")).slice(1,t.length-1))}}`},l=function(t){if(t.startsWith("{")&&t.endsWith("}"))return function(t){return 0==t.length?"":decodeURIComponent("%"+(t.match(/.{1,2}/g)||[]).join("%"))}(t.slice(1,t.length-1))};let c=t.replace(o,"").replace(new RegExp(`({[^}]*})+?|;([^${r(s)}]*)`,"g"),(function(t,e,s){return void 0!==e?h(e):" "+h(`{${s.slice(1)}}`)})).replace(new RegExp(r(s),"g")," ");const u=/(\([^()]+\))+?/g;for(;u.test(c);)c=c.replace(u,"");c=c.replace(/\d+\.(\.\.)?/g,""),c=c.replace(/\.\.\./g,""),c=c.replace(/\$\d+/g,"");let _=c.trim().split(new RegExp(/\s+/));_=_.filter((t=>""!==t));let f="";for(let t=0;t<_.length;t++){const s=l(_[t]);if(void 0!==s){this._comments[this.fen()]=s;continue}const r=this._moveFromSan(_[t],e);if(null==r){if(!(A.indexOf(_[t])>-1))throw new Error(`Invalid move in PGN: ${_[t]}`);f=_[t]}else f="",this._makeMove(r),this._positionCounts[this.fen()]++}f&&Object.keys(this._header).length&&!this._header.Result&&this.header("Result",f)}_moveToSan(t,e){let s="";if(t.flags&d.KSIDE_CASTLE)s="O-O";else if(t.flags&d.QSIDE_CASTLE)s="O-O-O";else{if(t.piece!==o){const r=function(t,e){const s=t.from,r=t.to,i=t.piece;let o=0,n=0,a=0;for(let t=0,h=e.length;t<h;t++){const h=e[t].from,l=e[t].to;i===e[t].piece&&s!==h&&r===l&&(o++,w(s)===w(h)&&n++,N(s)===N(h)&&a++)}return o>0?n>0&&a>0?q(s):a>0?q(s).charAt(1):q(s).charAt(0):""}(t,e);s+=t.piece.toUpperCase()+r}t.flags&(d.CAPTURE|d.EP_CAPTURE)&&(t.piece===o&&(s+=q(t.from)[0]),s+="x"),s+=q(t.to),t.promotion&&(s+="="+t.promotion.toUpperCase())}return this._makeMove(t),this.isCheck()&&(this.isCheckmate()?s+="#":s+="+"),this._undoMove(),s}_moveFromSan(t,e=!1){const s=O(t);let r,i,o,n,a,h=M(s),l=this._moves({legal:!0,piece:h});for(let t=0,e=l.length;t<e;t++)if(s===O(this._moveToSan(l[t],l)))return l[t];if(e)return null;let c=!1;if(i=s.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/),i?(r=i[1],o=i[2],n=i[3],a=i[4],1==o.length&&(c=!0)):(i=s.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/),i&&(r=i[1],o=i[2],n=i[3],a=i[4],1==o.length&&(c=!0))),h=M(s),l=this._moves({legal:!0,piece:r||h}),!n)return null;for(let t=0,e=l.length;t<e;t++)if(o){if(!(r&&r.toLowerCase()!=l[t].piece||m[o]!=l[t].from||m[n]!=l[t].to||a&&a.toLowerCase()!=l[t].promotion))return l[t];if(c){const e=q(l[t].from);if(!(r&&r.toLowerCase()!=l[t].piece||m[n]!=l[t].to||o!=e[0]&&o!=e[1]||a&&a.toLowerCase()!=l[t].promotion))return l[t]}}else if(s===O(this._moveToSan(l[t],l)).replace("x",""))return l[t];return null}ascii(){let t="   +------------------------+\n";for(let e=m.a8;e<=m.h1;e++){if(0===N(e)&&(t+=" "+"87654321"[w(e)]+" |"),this._board[e]){const s=this._board[e].type;t+=" "+(this._board[e].color===r?s.toUpperCase():s.toLowerCase())+" "}else t+=" . ";e+1&136&&(t+="|\n",e+=8)}return t+="   +------------------------+\n",t+="     a  b  c  d  e  f  g  h",t}perft(t){const e=this._moves({legal:!1});let s=0;const r=this._turn;for(let i=0,o=e.length;i<o;i++)this._makeMove(e[i]),this._isKingAttacked(r)||(t-1>0?s+=this.perft(t-1):s++),this._undoMove();return s}_makePretty(t){const{color:e,piece:s,from:r,to:i,flags:o,captured:n,promotion:a}=t;let h="";for(const t in d)d[t]&o&&(h+=f[t]);const l=q(r),c=q(i),u={color:e,piece:s,from:l,to:c,san:this._moveToSan(t,this._moves({legal:!0})),flags:h,lan:l+c,before:this.fen(),after:""};return this._makeMove(t),u.after=this.fen(),this._undoMove(),n&&(u.captured=n),a&&(u.promotion=a,u.lan+=a),u}turn(){return this._turn}board(){const t=[];let e=[];for(let s=m.a8;s<=m.h1;s++)null==this._board[s]?e.push(null):e.push({square:q(s),type:this._board[s].type,color:this._board[s].color}),s+1&136&&(t.push(e),e=[],s+=8);return t}squareColor(t){if(t in m){const e=m[t];return(w(e)+N(e))%2==0?"light":"dark"}return null}history({verbose:t=!1}={}){const e=[],s=[];for(;this._history.length>0;)e.push(this._undoMove());for(;;){const r=e.pop();if(!r)break;t?s.push(this._makePretty(r)):s.push(this._moveToSan(r,this._moves())),this._makeMove(r)}return s}_pruneComments(){const t=[],e={},s=t=>{t in this._comments&&(e[t]=this._comments[t])};for(;this._history.length>0;)t.push(this._undoMove());for(s(this.fen());;){const e=t.pop();if(!e)break;this._makeMove(e),s(this.fen())}this._comments=e}getComment(){return this._comments[this.fen()]}setComment(t){this._comments[this.fen()]=t.replace("{","[").replace("}","]")}deleteComment(){const t=this._comments[this.fen()];return delete this._comments[this.fen()],t}getComments(){return this._pruneComments(),Object.keys(this._comments).map((t=>({fen:t,comment:this._comments[t]})))}deleteComments(){return this._pruneComments(),Object.keys(this._comments).map((t=>{const e=this._comments[t];return delete this._comments[t],{fen:t,comment:e}}))}setCastlingRights(t,e){for(const s of[c,l])void 0!==e[s]&&(e[s]?this._castling[t]|=C[s]:this._castling[t]&=~C[s]);this._updateCastlingRights();const s=this.getCastlingRights(t);return!(void 0!==e[c]&&e[c]!==s[c]||void 0!==e[l]&&e[l]!==s[l])}getCastlingRights(t){return{[c]:0!=(this._castling[t]&C[c]),[l]:0!=(this._castling[t]&C[l])}}moveNumber(){return this._moveNumber}}}},e={};function s(r){var i=e[r];if(void 0!==i)return i.exports;var o=e[r]={exports:{}};return t[r](o,o.exports,s),o.exports}s.d=(t,e)=>{for(var r in e)s.o(e,r)&&!s.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},s.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),s.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{const{Chess:t}=s(167);var e=null,r=($("#myBoard"),new t),i=$("#status"),o=$("#fen"),n=$("#pgn");function a(){$("#myBoard .square-55d63").css("background","")}function h(t){var e=$("#myBoard .square-"+t),s="#a9a9a9";e.hasClass("black-3c85d")&&(s="#696969"),e.css("background",s)}function l(){var t="",e="White";"b"===r.turn()&&(e="Black"),r.isCheckmate()?t="Game over, "+e+" is in checkmate.":r.isDraw()?t="Game over, drawn position":(t=e+" to move",r.isCheck()&&(t+=", "+e+" is in check")),i.html(t),o.html(r.fen()),n.html(r.pgn())}var c={draggable:!0,position:"start",onDragStart:function(t,e){return!r.isGameOver()&&!("w"===r.turn()&&-1!==e.search(/^b/)||"b"===r.turn()&&-1!==e.search(/^w/))&&void 0},onDrop:function(t,s){a();try{r.move({from:t,to:s,promotion:"q"})}catch(t){return"snapback"}(function(t){if(r.isCheckmate())$("#status").html(`<b>Checkmate!</b> Oops, <b>${t}</b> lost.`);else if(r.isInsufficientMaterial())$("#status").html("It's a <b>draw!</b> (Insufficient Material)");else if(r.isThreefoldRepetition())$("#status").html("It's a <b>draw!</b> (Threefold Repetition)");else if(r.isStalemate())$("#status").html("It's a <b>draw!</b> (Stalemate)");else{if(!r.isDraw())return r.isCheck()?($("#status").html(`Oops, <b>${t}</b> is in <b>check!</b>`),!1):($("#status").html("No check, checkmate, or draw."),!1);$("#status").html("It's a <b>draw!</b> (50-move Rule)")}return!0})("black")||window.setTimeout((function(){!function(t){let s;s=b(r,"b",0)[0];const i={from:s.from,to:s.to,promotion:"q"};r.move(i),e.position(r.fen()),l()}()}),250),l()},onMouseoutSquare:function(t,e){a()},onMouseoverSquare:function(t,e){var s=r.moves({square:t,verbose:!0});if(0!==s.length){h(t);for(var i=0;i<s.length;i++)h(s[i].to)}},onSnapEnd:function(){e.position(r.fen())}};e=Chessboard("myBoard",c),l();var u={p:100,n:280,b:320,r:479,q:929,k:6e4,k_e:6e4},_={p:[[100,100,100,100,105,100,100,100],[78,83,86,73,102,82,85,90],[7,29,21,44,40,31,44,7],[-17,16,-2,15,14,0,15,-13],[-26,3,10,9,6,1,0,-23],[-22,9,5,-11,-10,-2,3,-19],[-31,8,-7,-37,-36,-14,3,-31],[0,0,0,0,0,0,0,0]],n:[[-66,-53,-75,-75,-10,-55,-58,-70],[-3,-6,100,-36,4,62,-4,-14],[10,67,1,74,73,27,62,-2],[24,24,45,37,33,41,25,17],[-1,5,31,21,22,35,2,0],[-18,10,13,22,18,15,11,-14],[-23,-15,2,0,2,0,-23,-20],[-74,-23,-26,-24,-19,-35,-22,-69]],b:[[-59,-78,-82,-76,-23,-107,-37,-50],[-11,20,35,-42,-39,31,2,-22],[-9,39,-32,41,52,-10,28,-14],[25,17,20,34,26,25,15,10],[13,10,17,23,17,16,0,7],[14,25,24,15,8,25,20,15],[19,20,11,6,7,6,20,16],[-7,2,-15,-12,-14,-15,-10,-10]],r:[[35,29,33,4,37,33,56,50],[55,29,56,67,55,62,34,60],[19,35,28,33,45,27,25,15],[0,5,16,13,18,-4,-9,-6],[-28,-35,-16,-21,-13,-29,-46,-30],[-42,-28,-42,-25,-25,-35,-26,-46],[-53,-38,-31,-26,-29,-43,-44,-53],[-30,-24,-18,5,-2,-18,-31,-32]],q:[[6,1,-8,-104,69,24,88,26],[14,32,60,-10,20,76,57,24],[-2,43,32,60,72,63,43,2],[1,-16,22,17,25,20,-13,-6],[-14,-15,-2,-5,-1,-10,-20,-22],[-30,-6,-13,-11,-16,-11,-16,-27],[-36,-18,0,-19,-15,-15,-21,-38],[-39,-30,-31,-13,-31,-36,-34,-42]],k:[[4,54,47,-99,-99,60,83,-62],[-32,10,55,56,56,55,10,3],[-62,12,-57,44,-67,28,37,-31],[-55,50,11,-4,-19,13,0,-49],[-55,-43,-52,-28,-51,-47,-8,-50],[-47,-42,-43,-79,-64,-32,-29,-32],[-4,3,-14,-50,-57,-18,13,4],[17,30,-3,-14,6,-1,40,18]],k_e:[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]]},f={p:_.p.slice().reverse(),n:_.n.slice().reverse(),b:_.b.slice().reverse(),r:_.r.slice().reverse(),q:_.q.slice().reverse(),k:_.k.slice().reverse(),k_e:_.k_e.slice().reverse()},p={w:f,b:_},d={w:_,b:f};function m(t,e,s){var r=[8-parseInt(t.from[1]),t.from.charCodeAt(0)-"a".charCodeAt(0)],i=[8-parseInt(t.to[1]),t.to.charCodeAt(0)-"a".charCodeAt(0)];return e<-1500&&("k"===t.piece?t.piece="k_e":"k"===t.captured&&(t.captured="k_e")),"captured"in t&&(t.color===s?e+=u[t.captured]+p[t.color][t.captured][i[0]][i[1]]:e-=u[t.captured]+d[t.color][t.captured][i[0]][i[1]]),t.flags.includes("p")?(t.promotion="q",t.color===s?(e-=u[t.piece]+d[t.color][t.piece][r[0]][r[1]],e+=u[t.promotion]+d[t.color][t.promotion][i[0]][i[1]]):(e+=u[t.piece]+d[t.color][t.piece][r[0]][r[1]],e-=u[t.promotion]+d[t.color][t.promotion][i[0]][i[1]])):t.color!==s?(e+=d[t.color][t.piece][r[0]][r[1]],e-=d[t.color][t.piece][i[0]][i[1]]):(e-=d[t.color][t.piece][r[0]][r[1]],e+=d[t.color][t.piece][i[0]][i[1]]),e}function g(t,e,s,r,i,o,n){var a,h=t.moves({verbose:!0});if(h.sort((function(t,e){return.5-Math.random()})),0===e||0===h.length)return[null,o];for(var l,c=Number.NEGATIVE_INFINITY,u=Number.POSITIVE_INFINITY,_=0;_<h.length;_++){a=h[_];var f=t.move(a),p=m(f,o,n),[d,b]=g(t,e-1,s,r,!i,p,n);if(t.undo(),i?(b>c&&(c=b,l=f),b>s&&(s=b)):(b<u&&(u=b,l=f),b<r&&(r=b)),s>=r)break}return i?[l,c]:[l,u]}function b(t,e,s){let r;r="b"===e?parseInt($("#search-depth").find(":selected").text()):parseInt($("#search-depth-white").find(":selected").text()),(new Date).getTime();var[i,o]=g(t,r,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,!0,s,e);return[i,o]}})()})();