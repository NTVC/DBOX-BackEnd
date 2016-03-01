var tvseriesModal = "#tvseriesModal";
var searchTvSeriesModal = "#searchTvSeriesModal";
var mmgTvSeriesModal = "#mmgTvSeriesModal";
var addListModal = "#addListModal";
var addVideoModal = "#addVideoModal";

var tvseriesThumb = "#tvSeriesThumb";
var tvseriesBackground = "#tvSeriesBackground";
var tvseriesCover = "#tvSeriesCover";
var tvseriesListThumb = "#tvSeriesListThumb";

var path = '/handler/tvseries';
var pathList = '/handler/tvseriesList';
var pathVideo = '/handler/tvseriesVideo';

$(document).ready(function () {
    
    $(mmgTvSeriesModal).find('.modal-dialog').css({ width: '98%', height: 'auto', 'max-height': '95%' });
    
    $(addListModal).on('hidden.bs.modal', function () {
        $(mmgTvSeriesModal).modal('show');
    });
});

dbox.controller('tvseriesListController', function ($scope, genericService) {
    $scope.tvseries = null;
    $scope.categories = getCategories();
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
        $scope.filter.pg.index = 0;
        $scope.search();
    };
    
    // SEARCH TVSERIESS
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        genericService.form(path, getFilter(false), bindTvSeries);
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.form(path, getFilter(true), bindTvSeriesPg);
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
    
    // NEW TVSERIES
    $scope.new = function () {
        $(searchTvSeriesModal).modal('show');
    };
    
    // EDIT VIDEO AND LIST TVSERIES
    $scope.addInfo = function (data) {
        
        getScope(mmgTvSeriesModal).getList(data);
        setTimeout(function () { ModelPicSize(); }, 500);

        $(mmgTvSeriesModal).modal('show');
    };
    
    // EDIT TVSERIES
    $scope.edit = function (data) {
        
        setTvSeriesModal(data, false);
    };
    
    // DELETE TVSERIES
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete tvseries';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the tvseries <b>' + data.title + '</b>?';
        modal.invoke = 'deleteTvSeries';
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
        
        // DELETE TVSERIES
        if (ac == 'deleteTvSeries') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            genericService.form(path, keywords, deleteTvSeries);
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

dbox.controller('tvseriesModalController', function ($scope, genericService) {
    
    $scope.tvseries = null;
    $scope.categories = getCategories();
    $scope.countries = getCountries();
    $scope.languages = getLanguages();
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.tvseries.thumb_file = getFileUploud(tvseriesThumb);
            $scope.tvseries.background_file = getFileUploud(tvseriesBackground);
            $scope.tvseries.cover_file = getFileUploud(tvseriesCover);
            $scope.tvseries.loader = true;
            $scope.tvseries.save = true;
            
            genericService.form(path, $scope.tvseries, listTvSeries);
            
        }
    };
    
    $scope.toggleSelection = function toggleSelection(id, isCategory) {
        
        var obj = null;
        if(isCategory){
            if(!$scope.tvseries.category){
                $scope.tvseries.category = [];
            }
            obj = $scope.tvseries.category;
        }
        else{
            if(!$scope.tvseries.category){
                $scope.tvseries.category = [];
            }
            obj = $scope.tvseries.language;
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
        $scope.tvseries.error = null;
        
        if (isNullorEmpty($scope.tvseries.title))
            error += errorTemplate('Title');
        if ($scope.tvseries.category == undefined || $scope.tvseries.category.length == 0)
            error += errorTemplate('At least one category');
        if (isNullorEmpty($scope.tvseries.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.tvseries.error = error;
            return false;
        }
        else
            return true;
    };
    
});

dbox.controller('searchTvSeriesModalController', function ($scope, genericService) {
    
    $scope.filter = {search:'', type: 'series'};
    $scope.lstTvSeriess = null;
    $scope.tvseries = {};
    var wServiceAllM = {plot: 'full', r:'json', type:'series', s:''};
    var wServiceM = { plot: 'full', r: 'json', i: '' };

    $scope.search = function () {
        
        wServiceAllM.s = $scope.filter.search;
        wServiceAllM.type = $scope.filter.type;

        $scope.tvseries.loader = 1;
        $scope.lstTvSeriess = null;

        genericService.omdbapi(wServiceAllM).then(function (data) {
            $scope.lstTvSeriess = data;
            $scope.tvseries.loader = null;
            
        });

    };
    
    $scope.newTemplate = function () {
        
        var data = { status: true};
        setTvSeriesModal(data, false);
    };
    
    $scope.add = function (data) {

        wServiceM.i = data.imdbID;
        genericService.omdbapi(wServiceM).then(function (data) {
            
            $(searchTvSeriesModal).modal('hide');
            var o = $scope.setObj(data);
            setTvSeriesModal(o, true);
        });
    };
     
    $scope.setObj = function (data) {

        var obj = {
            "status": "true", 
            "thumb": data.Poster, 
            "description": data.Plot,
            "title": data.Title, 
            "language": data.Language, 
            "country": data.Country, 
            "tags":  $.isArray(data.Genre) ? data.Genre :data.Genre.split(','),
            "year": data.Year,
            "search":true
        }

        return obj;
    };
});

// OPEN UP MODAL EDITING
function setTvSeriesModal(data, isSearch) {
    
    var s = getScope("tvseriesModal");
    
    var c = angular.copy(data);
    c.status = String(c.status);
    
    s.tvseries = c;
    
    if (!isSearch) {
        s.old_scope = angular.copy(c);
    }
    ModelPicSize();
    $(tvseriesModal).modal('show');
};

// ------------------------------------------------------  ------------------------------------------------------
// CALLBACKS
// ------------------------------------------------------  ------------------------------------------------------


// ------------------------------------------------------
// BIND FUNCTIONS
function listTvSeries(data) {
    
    var s = getScope("container");
    var sX = getScope("tvseriesModal");
    
    $(tvseriesModal).modal('hide');
    
    sX.tvseries.loader = null;
    
    s.rSearch();
    s.$apply();
}

function bindTvSeries(data) {
    var s = getScope('container');
    s.tvseries = data;
    s.$apply();

    addCountryJs();
}

function bindTvSeriesPg(data) {
    var s = getScope('container');
    s.filter.pg.total = data;
    s.filter.pg = preparePagination(s.filter.pg);
    s.$apply();
}


// ------------------------------------------------------
// DELETE FUNCTIONS
function deleteTvSeries(result) {
    
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
    
    getScope(mmgTvSeriesModal).getList();
    
    $(mmgTvSeriesModal).modal('show');
}


// ------------------------------------------------------  ------------------------------------------------------
// END CALLBACKS
