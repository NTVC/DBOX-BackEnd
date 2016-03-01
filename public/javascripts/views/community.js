var communityModal = "#communityModal";
var searchCommunityModal = "#searchCommunityModal";
var mmgCommunityModal = "#mmgCommunityModal";
var addListModal = "#addListModal";
var addVideoModal = "#addVideoModal";

var communityThumb = "#communityThumb";
var communityBackground = "#communityBackground";
var communityCover = "#communityCover";
var communityListThumb = "#communityListThumb";

var path = '/handler/community';
var pathList = '/handler/communityList';
var pathVideo = '/handler/communityVideo';

$(document).ready(function () {
    
    $(mmgCommunityModal).find('.modal-dialog').css({ width: '98%', height: 'auto', 'max-height': '95%' });
    
    $(addListModal).on('hidden.bs.modal', function () {
        $(mmgCommunityModal).modal('show');
    });
});

dbox.controller('communityListController', function ($scope, genericService) {
    $scope.communities = null;
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
        genericService.form(path, getFilter(false), bindCommunity);
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.form(path, getFilter(true), bindCommunityPg);
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter =  angular.copy($scope.filter);
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
        setCommunityModal(data, false);
    };
    
    // EDIT VIDEO AND LIST COMMUNITY
    $scope.addInfo = function (data) {
        
        getScope(mmgCommunityModal).getList(data);
        setTimeout(function () { ModelPicSize(); }, 500);

        $(mmgCommunityModal).modal('show');
    };
    
    // EDIT COMMUNITY
    $scope.edit = function (data) {
        
        setCommunityModal(data, false);
    };
    
    // DELETE COMMUNITY
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete community';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the community <b>' + data.title + '</b>?';
        modal.invoke = 'deleteCommunity';
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
        if (ac == 'deleteCommunity') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            genericService.form(path, keywords, deleteCommunity);
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

dbox.controller('communityModalController', function ($scope, genericService) {
    
    $scope.community = null;
    $scope.categories = getCategoriesCommunity();
    $scope.countries = getCountries();
    $scope.languages = getLanguages();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.community.thumb_file = getFileUploud(communityThumb);
            $scope.community.background_file = getFileUploud(communityBackground);
            $scope.community.cover_file = getFileUploud(communityCover);
            $scope.community.loader = true;
            $scope.community.save = true;
            
            genericService.form(path, $scope.community, listCommunity);
            
        }
    };
    
    $scope.toggleSelection = function toggleSelection(id, isCategory) {
        
        var obj = null;
        if(isCategory){
            if(!$scope.community.category){
                $scope.community.category = [];
            }
            obj = $scope.community.category;
        }
        else{
            if(!$scope.community.category){
                $scope.community.category = [];
            }
            obj = $scope.community.language;
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
        $scope.community.error = null;
        
        if (isNullorEmpty($scope.community.title))
            error += errorTemplate('Title');
        if ($scope.community.category == undefined || $scope.community.category.length == 0)
            error += errorTemplate('At least one category');
        if (isNullorEmpty($scope.community.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.community.error = error;
            return false;
        }
        else
            return true;
    };
    
});




// OPEN UP MODAL EDITING
function setCommunityModal(data, isSearch) {
    
    var s = getScope("communityModal");
    
    var c = angular.copy(data);
    c.status = String(c.status);
    
    s.community = c;
    
    if (!isSearch) {
        s.old_scope = angular.copy(c);
    }
    ModelPicSize();
    $(communityModal).modal('show');
};

// ------------------------------------------------------  ------------------------------------------------------
// CALLBACKS
// ------------------------------------------------------  ------------------------------------------------------


// ------------------------------------------------------
// BIND FUNCTIONS
function listCommunity(data) {
    
    var s = getScope("container");
    var sX = getScope("communityModal");
    
    $(communityModal).modal('hide');
    
    sX.community.loader = null;
    
    s.rSearch();
    s.$apply();
}

function bindCommunity(data) {
    var s = getScope('container');
    s.communities = data;
    s.$apply();

    addCountryJs();
}

function bindCommunityPg(data) {
    var s = getScope('container');
    s.filter.pg.total = data;
    s.filter.pg = preparePagination(s.filter.pg);
    s.$apply();
}


// ------------------------------------------------------
// DELETE FUNCTIONS
function deleteCommunity(result) {
    
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
    
    getScope(mmgCommunityModal).getList();
    
    $(mmgCommunityModal).modal('show');
}


// ------------------------------------------------------  ------------------------------------------------------
// END CALLBACKS
