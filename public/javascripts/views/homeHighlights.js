var path = '/handler/homeHighlights';
var addListModal = "#addListModal";
var addContentModal = "#addContentModal";

/*##############################################################*/
// MAIN CONTAINER CONTROLLER
dbox.controller('highLightsController', function ($scope, genericService) {
    
    $scope.highlights = null;
    $scope.countries = getCountries();
    
    // BASIC FILTER
    $scope.filter = {
        search: '',
        status: '1',
        country: 'CA',
        pg: {
            index: 0, 
            limit: '25',
            range: 0,
            total: 0
        }
    }
    
    // GET ALL OBJECTS FROM THE DATABASE AND SET IN THE SCOPE
    $scope.loadAll = function (){
        
        $scope.highlights = null;
        // GET ALL DATA ON THE BASE
        genericService.handler(path, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.highlights = data;
                setTimeout(function () { sortable() }, 1000);
            }
        });
    }
    
    // ADD OR EDIT CONTENT FROM THE CURRENT HIGHLIGHT
    $scope.editContent = function (highlight, content) {
        getScope('addContentModal').editContent(highlight, content);
    };
    
    // ADD OR EDIT ONE HIGHLIGHT BLOCK
    $scope.edit = function (data) {
        getScope('addListModal').edit(data);
    };
    
    // MODAL TO CONFIRM DELETION OF CONTENT FROM THE CURRENT HIGHLIGHT BLOCK
    $scope.delete_content = function (highlight, list, index) {
        
        var modal = {};
        
        modal.title = 'Delete Content';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the content <b>' + (list.title || "random") + '</b>?';
        modal.invoke = 'deleteContent';
        
        modal.obj = { index: index, highlight: highlight, list: list };
        
        setMainModal(modal);
    };
    
    // ORDERING HIGHTLIGHT BLOCKS 
    $scope.orderApps = function (orderArray) {
        
        if (!orderArray) {
            return false;
        }
        
        genericService.handler(path, { order_apps: true, array: orderArray }).then(function (data) {
            
            showNotification();
        });
    }
    
    // MODAL TO CONFIRM DELETION OF THE CURRENT HIGHLIGHT BLOCK
    $scope.delete = function (data) {
        
        var modal = {};
        
        modal.title = 'Delete highlight';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the highlight <b>' + data.title + '</b>?';
        modal.invoke = 'deleteHighlight';
        modal.obj = data;
        
        setMainModal(modal);
    };
    
    // GET FILTER CURRENT VALUES
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter.list = true;
        filter.search = $scope.filter.search;
        filter.status = $scope.filter.status;
        filter.country = $scope.filter.country;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }

    $scope.loadAll();
});

/*##############################################################*/
// HIGHLIGHT BLOCK FORM
dbox.controller('addListModalController', function ($scope, genericService) {
    
    $scope.sources = {};
    $scope.list = {};
    $scope.old_scope = null;
    
    $scope.setSources = function () {
        
        genericService.json('homescreen/highlight.source.json').then(function (data) {
            $scope.sources = data;
        });
    };
    
    $scope.edit = function (data) {
        $scope.list = data;
        $scope.old_scope = angular.copy(data);
        
        $(addListModal).modal('show');
    };
    
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.list.loader = true;
            $scope.list.save = true;
            // ADD COUNTRY
            $scope.list.country = getScope("container").filter.country;
            
            // SAVE ON THE DATABASE
            genericService.form(path, $scope.list, doneSaveHighLight);
        }
    };
    
    // VALIDATE FORM
    var validation = function () {
        
        var error = '';
        delete $scope.list.error;
        
        if (isNullorEmpty($scope.list.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.list.source))
            error += errorTemplate('Source');
        if (isNullorEmpty($scope.list.status))
            error += errorTemplate('Status');
            
       
        // NO CHANGES
        if (isNullorEmpty(error) && angular.equals($scope.list, $scope.old_scope))
            error += errorTemplate('No changes to save');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.list.error = error;
            return false;
        }
        else{
            $scope.list.error = null;
            return true;
        }
    };
    
    // GET SOURCES
    $scope.setSources();
});

/*##############################################################*/
// HIGHLIGHT CONTENT FORM
dbox.controller('addContentModalController', function ($scope, genericService) {
    
    $scope.highlight = {};
    $scope.content = {};
    
    // BASIC FILTER
    $scope.filter = {
        search: '',
        active: '1',
        list: true,
        pg: {
            index: 0, 
            limit: '10'
        }
    }
    
    $scope.lstContent = {};
    $scope.contentTypes = {};
    
    $scope.setTypes = function () {
        
        genericService.json('homescreen/highlight.type.json').then(function (data) {
            $scope.contentTypes = data;
        });
    };
    
    $scope.editContent = function (highlight, content) {

        $scope.highlight = highlight;
        $scope.content = content;
        $(addContentModal).modal('show');
    };
    
    $scope.search = function () {
        
        var handler = "";
        var isGET = true;
        
        $scope.lstContent = null;

        // LIVE
        if ($scope.highlight.source == 1) {
            handler = '/handler/live';
            isGET = true;
        }
        // Movie
        else if ($scope.highlight.source == 2) {
            handler = "/handler/movie";
            isGET = true;
        }
        // TV Series
        else if ($scope.highlight.source == 3) {
            handler = '/handler/tvseries';
            isGET = false;
        }
        // Community
        else if ($scope.highlight.source == 4){
            handler = '/handler/community';
            isGET = false;
        }
        // Youtubers
        else if ($scope.highlight.source == 5){
            handler = '/handler/youtuber';
            isGET = false;
        }
        
        if (isGET) {
            genericService.handler(handler, $scope.filter).then(function (data) {
                $scope.lstContent = data;
                $scope.content.loader  = null;
            });
        }
        else {
            genericService.form(handler, $scope.filter, getListContent);
        }
    };
    
    $scope.add = function (data) {
        

        var obj = {
            id: data._id, 
            cover: data.cover,
            type_content: parseInt($scope.content.type),
            title: (data.title ? data.title : data.name),
            description: data.description
        };

        $scope.highlight.list.push(obj);
        save();
    };
    
    $scope.random = function () {
        
        var obj = {id: null, type_content: parseInt( $scope.content.type )};
        $scope.highlight.list.push(obj);

        save();
    };
    
    
    var save = function () {
        
        $scope.highlight.loader = true;
        $scope.highlight.save = true;
            
        // SAVE ON THE DATABASE
        genericService.form(path, $scope.highlight, doneSaveContent);
    };

    // LOAD TYPES
    $scope.setTypes();
});

/*##############################################################*/
//MODALS
dbox.controller('genericModal', function ($scope, genericService) {
    
    $scope.modal = {};
    
    $scope.modalAction = function (ac) {
        
        var keywords = null;
        $scope.modal.loader = 1;
        
        // DELETE APP
        if (ac == 'deleteHighlight') {
            
            keywords = { id: $scope.modal.obj._id, "delete": true };
            
            genericService.handler(path, keywords).then(function (response) {
                if (checkMessage(response)) {
                    
                    modelAlertClose();
                    
                    var s = getScope("container");
                    
                    var index = s.highlights.indexOf($scope.modal.obj);
                    s.highlights.splice(index, 1);
                    $scope.modal = null;
                }
            });
        }
        // DELETE CONTENT
        else if (ac == 'deleteContent') {
            
            var obj = $scope.modal.obj;

            obj.highlight.list.splice(obj.index, 1);
            obj.highlight.save = true;

            genericService.form(path, obj.highlight, doneDeleteList);
        }
    };

});

function doneDeleteList(data) {
    
    modelAlertClose();

    getScope("genericModal").modal = null;
    getScope('container').loadAll();
    $(addListModal).modal('hide');
}

function doneSaveHighLight(data){
    
    var s = getScope(addListModal);
    
    s.list = {};
    s.$apply();
    
    getScope('container').loadAll();
    $(addListModal).modal('hide');
}

function doneSaveContent(data) {

    getScope(addContentModal).highlight.save = null;
    getScope('container').loadAll();

    $(addContentModal).modal('hide');
}

function getListContent(data) {
    var s = getScope(addContentModal);
    
    s.lstContent = data;
    s.$apply();
}

function sortable() {
    
    var order = '.app-order';
    
    try { $(order).sortable("destroy"); } catch (ex) { }
    $(order).sortable({
        stop: function (event, ui) {
            getScope("container").orderApps(JSON.stringify($(order).sortable("toArray")));
        }
    });
}
