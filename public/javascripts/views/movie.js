var movieModal = "#movieModal";
var searchMovieModal = "#searchMovieModal";
var path = "/handler/movie";

var movieThumb = "#movieThumb";
var movieCover = "#movieCover";
var movie_file = "#movie_file";

dbox.controller('movieListController', function ($scope, genericService) {
    $scope.movies = null;
    $scope.limits = getShowLimit();
    
    $scope.filter = {
        search: '',
        active: '1',
        isPublished: '1',
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
    
    // SEARCH MOVIES
    $scope.search = function () {
        
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.movies = data;
            }
        });
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(path, getFilter(true)).then(function (data) {
            
            $scope.filter.pg.total = data;
            $scope.filter.pg = preparePagination($scope.filter.pg);
        });
    };
    
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.active = $scope.filter.active;
        filter.isPublished = $scope.filter.isPublished;
        
        if (isCounter) {
            filter.count = true;
        }
        
        filter.pg = {
            index: $scope.filter.pg.index,
            limit: $scope.filter.pg.limit
        }
        
        return filter;

    }
    
    // PRINT LANGUAGES LIKE TAGS
    $scope.languages = function (data) {
        
        if (data == undefined) {
            return '';
        }

        var lst = data.split(',');
        var html = "";
        
        for (var i = 0; i < lst.length; i++) {
            if (!isNullorEmpty(lst[i])){
                html += '<span class="badge mr5 mb5">' + $.trim(lst[i]) + '</span>';
            }
        }
        
        return html;
        
    }

    // NEW MOVIE
    $scope.new = function () {
        $(searchMovieModal).modal('show');
    };
    
    // EDIT MOVIE
    $scope.edit = function (data) {
        
        setMovieModal(data, false);
    };
    
    // DELETE MOVIE
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete movie';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the movie <b>' + data.title + '</b>?';
        modal.invoke = 'deleteMovie';
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
        
        // DELETE MOVIE
        if (ac == 'deleteMovie') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    getScope("container").rSearch();
                    $scope.modal = null;
                }
            });
        }
    };

});

dbox.controller('movieModalController', function ($scope, genericService) {
    
    $scope.movie = null;
    $scope.categories = getCategories();
    $scope.languages = getLanguages();
    $scope.old_scope = null;
    
    $scope.new = function () {
        $scope.movie = {};
        $scope.old_scope = {};
        setTimeout("ModelPicSize();", 1000);
        $(movieModal).modal('show');
    };

    $scope.toggleSelection = function toggleSelection(id, isCategory) {
        
        var object = function(isCategory, isGet){
            
            if(isGet){
                if(isCategory){
                    obj = $scope.movie.category;
                }
                else{
                    obj = $scope.movie.language;
                }
                
                return obj;
            }
            else{
                if(isCategory){
                    $scope.movie.category = obj;
                }
                else{
                    $scope.movie.language = obj;
                }
            }
        };
        var obj = object(isCategory, true);
       
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
        
        object(isCategory, false);
    };
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.movie.loader = true;
            $scope.movie.save = true;
            $scope.movie.thumb_file = getFileUploud(movieThumb);
            $scope.movie.cover_file = getFileUploud(movieCover);
            
            //genericService.form(path, $scope.movie, doneSaveMovie);
            $scope.sendForm($scope.movie);
        }
    };
    
    $scope.sendForm = function(movie) {

        $("#fMovie").ajaxSubmit({
            url: path,
            uploadProgress: function (event, position, total, percentComplete) {
                var obj = "upPercent";

                percentComplete = percentComplete >= 98 ? 98 : percentComplete;

                $('#' + obj).html(percentComplete);
                $('.' + obj).css('width', (percentComplete + "%"));
                $('.' + obj).attr('aria-valuenow', percentComplete);

            },
            error: function () {
                showFailNotification();
            },
            complete: function (xhr) {
                scrollTop();
                doneSaveMovie(xhr.responseText);

                return false;
            }
        });

    }
    
    var validation = function () {
        
        var error = '';
        delete $scope.movie.error;
        
        //SET FILE
        if($(movie_file).length > 0)
            $scope.movie.file = getFileUploud(movie_file);
        
        if (isNullorEmpty($scope.movie.thumb))
            error += errorTemplate('Thumbnail');
        if (isNullorEmpty($scope.movie.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.movie.url) && isNullorEmpty($scope.movie.file))
            error += errorTemplate('File');
        if ($scope.movie.category == undefined || $scope.movie.category.length == 0)
            error += errorTemplate('At least one category');
        if (isNullorEmpty($scope.movie.active))
            error += errorTemplate('Status');
            
        if ($.trim(error) != "") {
            scrollTop();
            $scope.movie.error = error;
            return false;
        }
        else{
            $scope.movie.error = null;
            return true;
        }
    };
    
});

dbox.controller('searchMovieModalController', function ($scope, genericService) {
    
    $scope.filter = {search:'', old_search:null};
    $scope.lstMovies = null;
    $scope.movie = {};
    var wServiceAllM = {plot: 'full', r:'json', type:'movie', s:''};
    var wServiceM = { plot: 'full', r: 'json', i: '' };

    $scope.search = function () {
        
        // IF ARE THE SAME, AVOID CALL
        if ($scope.filter.search == $scope.filter.old_search) { return false; }
        else {
            
            wServiceAllM.s = $scope.filter.search;
            $scope.filter.old_search = $scope.filter.search;
            $scope.movie.loader = 1;
            $scope.lstMovies = null;
        }
        
        genericService.omdbapi(wServiceAllM).then(function (data) {
            $scope.lstMovies = data;
            $scope.movie.loader = null;
            
            setTimeout("ModelPicSize();", 1000);
        });

    };
    
    $scope.new = function () {
        getScope(movieModal).new();
    };
    
    $scope.add = function (data) {

        wServiceM.i = data.imdbID;
        genericService.omdbapi(wServiceM).then(function (data) {
            
            $(searchMovieModal).modal('hide');
            var o = $scope.setObj(data);
            setMovieModal(o, true);
            
            setTimeout("ModelPicSize();", 1000);
        });
    };
     
    $scope.setObj = function (data) {

        var obj = {
            "active": "true", 
            "exibitiondate": new Date( data.Released ), 
            "lenght": data.Runtime, 
            "thumb": data.Poster, 
            "description": data.Plot,
            "url": null, 
            "title": data.Title, 
            "rated": data.Rated, 
            "director": data.Director, 
            "writer": data.Writer,  
            "actors": data.Actors, 
            "language": data.Language, 
            "country": data.Country, 
            "awards": data.Awards, 
            "tags": data.Genre,
            "year": data.Year,
            "search":true
        }

        return obj;
    };
});

// OPEN UP MODAL EDITING
function setMovieModal(data, isSearch) {
    
    var s = getScope("movieModal");
    s.movie = data;
    
    if (!isSearch) {
        s.old_scope = angular.copy(data);
    }
    
    ModelPicSize();
    $(movieModal).modal('show');
};

function doneSaveMovie(data) {
    
    var s = getScope(movieModal);
    s.movie.loader = null;

    $(movieModal).modal('hide');
    getScope("container").rSearch();

    resetFileUploud(movieThumb);
    resetFileUploud(movieCover);
    resetFileUploud(movie_file);
}