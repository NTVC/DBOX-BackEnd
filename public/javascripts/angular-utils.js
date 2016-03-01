var dbox = angular.module('dbox', []);
var mm = "#genericModal";

// generic filters
dbox.filter('unsafe', function ($sce) { return function (val) { var decoded = angular.element('<textarea />').html(val).text(); return $sce.trustAsHtml(decoded); }; });
dbox.filter('isDateNullEmpty', function () { return function (val) { if (val == null) { return true } else if (val == '') { return true } else if (val == '0001-01-01T00:00:00') { return true } else { return false }; }; });
dbox.filter('isNullEmpty', function () { return function (val) { if (val == null) { return true } else if (val == '') { return true } else { return false }; }; });
dbox.filter('age', function () { return function (dateString) { if (dateString != null) { var today = new Date(); var birthDate = new Date(dateString); var age = today.getFullYear() - birthDate.getFullYear(); var m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; } }; });
dbox.filter('sThumb', function () { return function (img) { if (img == null) { return ''; } var r = ''; if (img.indexOf('_b.') > -1) { r = replaceAll('_b.', '_s.', img); } else { r = replaceAll('_m.', '_s.', img); } return r; }; });
dbox.filter('split', function () { return function (input, delimiter) { var delimiter = delimiter || ','; console.log(input); return input.split(delimiter); }; });
dbox.filter('hashtags', function () {return function (data) {if (data == undefined) {return '';}var lst;if ($.isArray(data)) {lst = data;}else {lst = data.split(',');}var html = "";for (var i = 0; i < lst.length; i++) {if (!isNullorEmpty(lst[i])) {html += '<span class="badge mr5 mb5">' + $.trim(lst[i]) + '</span>';}} return html;}});
dbox.filter('isPublished', function () {return function (data) {
    var html = '';
    html += '<span class="text-' + (data === true ? 'success' : 'danger') + '">';
    html += (data === true ? "Available" : "Unavailable") + '</span>';
    return html;
    }});
dbox.filter('status', function () {return function (data) {var html = '';html += '<span class="text-' + (data === true ? 'success' : 'danger') + '">';html += (data === true ? "Active" : "Inactive") + '</span>';return html;}});

dbox.filter("sum", function () { return function (a, b) { return parseInt(a) + parseInt(b); }; });
dbox.filter("mac", function () { return function (m) { if (m) { var r = ""; m = replaceAll(":", "", m); m = replaceAll("-", "", m); var counter = -1; for (var key in m) { if (counter == 1) { r += ":" + m[key]; counter = 0; } else { r += m[key]; counter++; } } return r; } }; });
dbox.filter("category", function () {return function (id) {var c = getCategories();var title = "";for (x in c) {if (c[x].id == id && title == "") {title = c[x].title;break;}}return title;};});
dbox.filter("language", function () {return function (code) {var c = getLanguages();var title = "";for (x in c) {if (c[x].code == code && title == "") {title = c[x].name;break;}}return title;};});
dbox.filter("isArray", function () { return function (input) { return angular.isArray(input); }; });
dbox.filter('getImage', function () {return function (val) {var df = 'images/noImage.png'; if (val == null) { return df } else if (val == '') { return df; } else { return val; };};});
    
dbox.filter("categoryCommunity", function () {return function (id) {var c = getCategoriesCommunity();var title = "";for (x in c) {if (c[x].id == id && title == "") {title = c[x].title;break;}}return title;};});
dbox.filter('trustUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}])
dbox.filter("call", function () { return function (a) { if (a != null) { try { a = a.replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''); a = a.replace(" ", ''); } catch(ex)  { console.log(ex); }} return a; }; });

// generic directives
dbox.directive('validDecimal', function () { return { require: '?ngModel', link: function (scope, element, attrs, ngModelCtrl) { if (!ngModelCtrl) { return; } ngModelCtrl.$parsers.push(function (val) { if (angular.isUndefined(val)) { var val = ''; } var clean = val.replace(/[^0-9\.]/g, ''); var decimalCheck = clean.split('.'); if (!angular.isUndefined(decimalCheck[1])) { decimalCheck[1] = decimalCheck[1].slice(0, 2); clean = decimalCheck[0] + '.' + decimalCheck[1]; } if (val !== clean) { ngModelCtrl.$setViewValue(clean); ngModelCtrl.$render(); } return clean; }); element.bind('keypress', function (event) { if (event.keyCode === 32) { event.preventDefault(); } }); } }; });
dbox.directive('ngEnter', function () { return function (scope, element, attrs) { element.bind("keydown keypress", function (event) { if (event.which === 13) { scope.$apply(function () { scope.$eval(attrs.ngEnter); }); event.preventDefault(); } }); }; });
dbox.directive('repeatDone', function () { return function (scope, element, attrs) { if (scope.$last) { scope.$eval(attrs.repeatDone); } } });
dbox.directive("initFromForm", function ($parse) { return { link: function (scope, element, attrs) { var attr = attrs.initFromForm || attrs.ngModel || element.attrs('name'), val = attrs.value || $(element).val(); $parse(attr).assign(scope, val) } }; });
dbox.directive('popover', function () { return function (scope, elem) { var placement = 'left'; if ($(elem).attr('data-placement') != undefined) { placement = $(elem).attr('data-placement'); } elem.popover({ placement: placement }); } });
dbox.directive('boolValue', function () { return { require: 'ngModel', link: function (scope, element, attr, ngModel) { function fromUser(value) { return value; } function toUser(value) { return value + ''; } ngModel.$parsers.push(fromUser); ngModel.$formatters.push(toUser); } }; })

dbox.factory('genericService', function ($http) {return {handler: function (path, keywords) {return $http({url: path,method: "post",params: keywords}).then(function (result, onError) {if (onError) {showFailNotification();}if (checkMessage(result)) {return result.data;}else {showFailNotification();}})},form: function (path, keywords, callback) {var formData = new FormData();for (var key in keywords) {if ($.isArray(keywords[key])) {formData.append(key, angular.toJson(keywords[key]));}else {formData.append(key, keywords[key]);}}return $.ajax({type: 'post',url: path,data: formData,contentType: false,cache: false,processData: false,async: true}).done(function (response) {resolveResponse(response, callback, false);}).error(function (response) {resolveResponse(response, callback, true);});},omdbapi: function (keywords) {return $http({url: "http://www.omdbapi.com?apikey=331dcb20",method: "get",params: keywords}).then(function (result) {if (result.data.Error != undefined) { return null; }else if (result.data.Search != undefined) { return result.data.Search; }else {return result.data;}});},json: function (url) {return $http.get("/json/" + url).then(function (result) {return result.data;});}}});

function resolveResponse(response, callback, isError){if(isError){showFailNotification();}if (checkMessage(response)) {try {if (typeof response == 'object') {callback(response);}else {callback(JSON.parse(response));}}catch (e) {callback(null);}}else {showFailNotification();}}

