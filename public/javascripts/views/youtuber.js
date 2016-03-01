var youtuberModal = "#youtuberModal";
var mmgYoutuberModal = "#mmgYoutuberModal";
var addListModal = "#addListModal";
var addVideoModal = "#addVideoModal";

var youtuberThumb = "#youtuberThumb";
var youtuberBackground = "#youtuberBackground";
var youtuberCover = "#youtuberCover";
var youtuberListThumb = "#youtuberListThumb";

var path = '/handler/youtuber';
var pathList = '/handler/youtuberList';
var pathVideo = '/handler/youtuberVideo';

$(document).ready(function () {
    
    $(mmgYoutuberModal).find('.modal-dialog').css({ width: '98%', height: 'auto', 'max-height': '95%' });
    
    $(addListModal).on('hidden.bs.modal', function () {
        $(mmgYoutuberModal).modal('show');
    });
});

dbox.controller('youtuberListController', function ($scope, genericService) {
    $scope.youtubers = null;
    $scope.categories = getCategoriesCommunity();
    $scope.countries = getCountries();
    $scope.limits = getShowLimit();
    
    $scope.filter = {
        search: '',
        category: '',
        country: '',
        status: '1',
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }

    // RESET SEARCH FILTER
    $scope.rSearch = function () {
        
        $scope.filter.search = "";
        $scope.filter.status = "";
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH COMMUNITYS
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        genericService.form(path, getFilter(false), bindYoutuber);
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.form(path, getFilter(true), bindYoutuberPg);
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter = angular.copy($scope.filter);
        filter.list = true;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = 0;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }
    
    // NEW COMMUNITY
    $scope.new = function () {
        var data = {status:'true'};
        setYoutuberModal(data, false);
    };
    
    // EDIT VIDEO AND LIST COMMUNITY
    $scope.addInfo = function (data) {
        
        getScope(mmgYoutuberModal).getList(data);
        setTimeout(function () { ModelPicSize(); }, 500);

        $(mmgYoutuberModal).modal('show');
    };
    
    // EDIT COMMUNITY
    $scope.edit = function (data) {
        
        setYoutuberModal(data, false);
    };
    
    // DELETE COMMUNITY
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete youtuber';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the youtuber <b>' + data.title + '</b>?';
        modal.invoke = 'deleteYoutuber';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    $scope.search();
});

dbox.controller('genericModal', function ($scope, genericService) {
    
    /*##############################################################*/
    //MODALS
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE COMMUNITY
        if (ac == 'deleteYoutuber') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            genericService.form(path, keywords, deleteYoutuber);
        }
        // DELETE LIST
        else if (ac == 'deleteList') {
            
            $scope.modal.obj.delete = true;
            genericService.form(pathList, $scope.modal.obj, deleteList);

        }
        // DELETE VIDEO
        else if (ac == 'deleteVideo') {
            $scope.modal.obj.delete = true;
            genericService.form(pathVideo, $scope.modal.obj, deleteVideo);
        }
    };

});

dbox.controller('youtuberModalController', function ($scope, genericService) {
    
    $scope.youtuber = null;
    $scope.categories = getCategoriesCommunity();
    $scope.countries = getCountries();
    $scope.languages = getLanguages();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.youtuber.thumb_file = getFileUploud(youtuberThumb);
            $scope.youtuber.background_file = getFileUploud(youtuberBackground);
            $scope.youtuber.cover_file = getFileUploud(youtuberCover);
            $scope.youtuber.loader = true;
            $scope.youtuber.save = true;
            
            genericService.form(path, $scope.youtuber, listYoutuber);
            
        }
    };
    
    $scope.toggleSelection = function toggleSelection(id, isCategory) {
        var obj = null;
        if(isCategory){
            if(!$scope.youtuber.category){
                $scope.youtuber.category = [];
            }
            obj = $scope.youtuber.category;
        }
        else{
            if(!$scope.youtuber.language){
                $scope.youtuber.language = [];
            }
            obj = $scope.youtuber.language;
        }
        
        // IF LANGUAGE DOESN'T EXIST, ADD AN EMPTY ARRAY
        if (obj == undefined){
            obj = [];
        }
        
        var index = obj.indexOf(id);
        
        if (obj[index] == undefined) {
            obj.push(id);
        }
        else {
            obj.splice(index, 1);
        }
    };
     
    var validation = function () {
        
        var error = '';
        $scope.youtuber.error = null;
        
        if (isNullorEmpty($scope.youtuber.title))
            error += errorTemplate('Title');
        if ($scope.youtuber.category == undefined || $scope.youtuber.category.length == 0)
            error += errorTemplate('At least one category');
        if (isNullorEmpty($scope.youtuber.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.youtuber.error = error;
            return false;
        }
        else
            return true;
    };
    
});




// OPEN UP MODAL EDITING
function setYoutuberModal(data, isSearch) {
    
    var s = getScope("youtuberModal");
    
    var c = angular.copy(data);
    c.status = String(c.status);
    
    s.youtuber = c;
    
    if (!isSearch) {
        s.old_scope = angular.copy(c);
    }
    ModelPicSize();
    $(youtuberModal).modal('show');
};

// ------------------------------------------------------  ------------------------------------------------------
// CALLBACKS
// ------------------------------------------------------  ------------------------------------------------------


// ------------------------------------------------------
// BIND FUNCTIONS
function listYoutuber(data) {
    
    var s = getScope("container");
    var sX = getScope("youtuberModal");
    
    $(youtuberModal).modal('hide');
    
    sX.youtuber.loader = null;
    
    s.rSearch();
    s.$apply();
}

function bindYoutuber(data) {
    var s = getScope('container');
    s.youtubers = data;
    s.$apply();

    addCountryJs();
}

function bindYoutuberPg(data) {
    var s = getScope('container');
    s.filter.pg.total = data;
    s.filter.pg = preparePagination(s.filter.pg);
    s.$apply();
}


// ------------------------------------------------------
// DELETE FUNCTIONS
function deleteYoutuber(result) {
    
    modelAlertClose();
    var s = getScope("container");
    var sX = getScope("genericModal");
    
    sX.modal = null;
    
    s.search();
    s.$apply();
    sX.$apply();
}

function deleteList(data) {
    
    modelAlertClose();
    
    var sX = getScope("genericModal");
    sX.modal = null;
    sX.$apply();
    
    getScope(mmgYoutuberModal).getList();
    
    $(mmgYoutuberModal).modal('show');
}


// ------------------------------------------------------  ------------------------------------------------------
// END CALLBACKS
