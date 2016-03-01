
// LIMIT DATA ON THE SCREEN
var showLimitJSON;
function getShowLimit() { if (!showLimitJSON) { showLimitJSON = JSON.parse($.ajax({ url: "json/show.limit.json", type: 'get', async: false, dataType: 'json' }).responseText); } return showLimitJSON; }

// GET COUNTRIES
var countriesJSON;
function getCountries() { if (!countriesJSON) { countriesJSON = JSON.parse($.ajax({ url: "json/countries.json", type: 'get', async: false, dataType: 'json' }).responseText); } return countriesJSON; }

var categoriesJSON;
function getCategories() { if (!categoriesJSON) { categoriesJSON = JSON.parse($.ajax({ url: "json/video.category.json", type: 'get', async: false, dataType: 'json' }).responseText); } return categoriesJSON; }

var categoriesCommunityJSON;
function getCategoriesCommunity() { if (!categoriesCommunityJSON) { categoriesCommunityJSON = JSON.parse($.ajax({ url: "json/community.category.json", type: 'get', async: false, dataType: 'json' }).responseText); } return categoriesCommunityJSON; }

var languagesSON;
function getLanguages() { if (!languagesSON) { languagesSON = JSON.parse($.ajax({ url: "json/language.json", type: 'get', async: false, dataType: 'json' }).responseText); } return languagesSON; }

// basic alerts
var toNp;
function showNotification() { hideFailNotification(); $('#nP-success').fadeIn(); clearTimeout(toNp); toNp = setTimeout(function () { hideNotification(); }, 3000); }
function hideNotification() { clearTimeout(toNp); $('#nP-success').fadeOut('slow'); }
function showFailNotification() { hideNotification(); $('#nP-error').fadeIn(); clearTimeout(toNp); toNp = setTimeout(function () { hideFailNotification(); }, 3000); }
function hideFailNotification() { clearTimeout(toNp); $('#nP-error').fadeOut('slow'); }

// main modal
function setMainModal(data) { var s = getScope("genericModal"); s.modal = data; $(mm).modal('show'); }
function modelAlertClose() { $(mm).modal('hide'); }

// generic function
function getQueryParams() {var qs = document.location.search;qs = qs.split('+').join(' ');var params = {},tokens,re = /[?&]?([^=]+)=([^&]*)/g;while (tokens = re.exec(qs)) {params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);}return params;}
function getBool(val){ var num = +val;return !isNaN(num) ? !!num : !!String(val).toLowerCase().replace(!!0,'');}
function isNullorEmpty(s) { if (s == undefined) { return true; } else if (s == null) { return true; } else if ($.trim(s) == "") { return true; } else { return false; } }
function preparePagination(p) {p = SetTotalPaginas(p);var r = []; for (var i = 1; i <= p.qtdPage; i++) { r.push(i); } p.range = r; return p;}
function SetTotalPaginas(p) {try {var total = parseInt(p.total);var limit = parseInt(p.limit);if (isFloat(total / limit)) {var s = String((total / limit));var index = s.indexOf('.');if (parseInt(s[index + 1]) >= 5) {p.qtdPage = Math.round(s);}else {p.qtdPage = Math.round(s) + 1;}}else {p.qtdPage = Math.round(total / limit);}} catch (ex) {p.qtdPage = 0;} return p;}
function isInt(n) {return Number(n) === n && n % 1 === 0;}
function isFloat(n) {return n === Number(n) && n % 1 !== 0;}
function replaceAll(find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }
function scrollTop() { $("html, body, .modal").animate({ scrollTop: 0 }, "slow"); }
function errorTemplate(m) { return '<span> - ' + m + '</span><br/>'; }
function getScope(a) { if (a.indexOf('#') > -1 || a.indexOf('.') > -1) { a = a.replace('#', ''); a = a.replace('.', ''); } return angular.element(document.getElementById(a)).scope(); }
function validateEmail(email) { var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; return re.test(email); }
function checkMessage(m) { m = $.trim(m); if (m == "SESSION_EXPIRED") { location.reload(true); } else if (m == "ERROR_IN_PROCESS") { showFailNotification(); return false; } else { return true; } }
function getBoolean(val) {if (val == undefined) { return false; } else if (val == null) { return false; }switch (val.toString().toLowerCase().trim()) {case "true": case "yes": case "1":return true;case "false": case "no": case "0": case null: return false;default: return false;}};
//function readURL(input, obj) {if (input.files && input.files[0]) {var reader = new FileReader();reader.onload = function (e) {var ele = $(obj).attr("data-key");if (ele) {ele = ele.split('.');var s = getScope(ele[0]);s[ele[1]][ele[2]] = null;s[ele[1]][ele[2]] = e.target.result;s.$apply();setTimeout(function () { ModelPicSize(); }, 500);}}; reader.readAsDataURL(input.files[0]);}}
function isValidMacAddress(macAdd) { var RegExPattern = /^[0-9a-fA-F:]+$/; if (!(macAdd.match(RegExPattern)) || macAdd.length != 17) { return false; } else { return true; } }
// ADD SCRIPT TO ADD COUNTRIES FLAGS
function addCountryJs() { var url = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-formhelpers/2.3.0/js/bootstrap-formhelpers.min.js"; $("script[src='" + url + "']").remove(); setTimeout(function () { $.getScript(url); }, 100); }
// GET PREVIEW IMAGE OF FILE
//function getFileThumb(obj) {$(obj).unbind();$(obj).trigger("click");$(obj).change(function () {readURL(this, obj);});}
// GET FILE ON THE UPLOUD INPUT
//function getFileUploud(obj) { var files = $(obj).get(0).files; if (files.length > 0) { return files[0]; } else { return ''; } }
function resetFileUploud(obj){ $(obj).replaceWith($(obj).clone());}
// SET IMAGE SIZE
var modelPic = ".pic";
$(document).ready(function () { setTimeout(function () { ModelPicSize(); }, 1000); $(window).resize(function () { setTimeout(function () { ModelPicSize(); }, 1000); }); });
function ModelPicSize() {$(modelPic).each(function () {var width = $(this).width(); var height = width; if (height > 0) {$(this).animate({ height: height });}});}


function readURL(input, obj) {if (input.files && input.files[0]) {var reader = new FileReader();reader.onload = function (e) {var ele = $(obj).attr("data-key");if (ele) {ele = ele.split('.');var s = getScope(ele[0]); s[ele[1]][ele[2]] = null; s[ele[1]][ele[2]] = e.target.result;s.$apply();setTimeout(function () { ModelPicSize(); }, 500);}}; reader.readAsDataURL(input.files[0]);}}
function getFileUploud(obj) { var files = $(obj).get(0).files; if (files.length > 0) { return files[0]; } else { return ''; } }
function getFileThumb(obj) {$(obj).trigger("click");}