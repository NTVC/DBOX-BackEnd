
dbox.controller('addListModalController', function ($scope, genericService) {
    
    $scope.tvserie_id = null;
    $scope.list = null;
    $scope.old_scope = null;
    
    var setInitialObj = function () {
        
        $scope.old_scope = angular.copy($scope.list);
        $(addListModal).modal('show');

    };
    
    $scope.edit = function (tvserie_id, list) {
        $scope.tvserie_id = tvserie_id;
        $scope.list = list;
        setInitialObj();
    };
    
    // SAVE OBJ ON THE DATABASE
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.list.loader = true;
            $scope.list.save = true;
            $scope.list.thumb_file = getFileUploud(tvseriesListThumb);
            
            if(!$scope.list.tvserie_id)
                $scope.list.tvserie_id = $scope.tvserie_id;
            
            genericService.form(pathList, $scope.list, backListModalTvSeries);

        }
    };
    
    var validation = function () {
        
        var error = '';
        $scope.list.error = null;
        
        if (isNullorEmpty($scope.list.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.list.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.list.error = error;
            return false;
        }
        else
            return true;
    };
    
});

function backListModalTvSeries(tvseries) {

    var s = getScope(addListModal);

    getScope(mmgTvSeriesModal).getList(null);
    
    s.tvserie_id = null;
    s.list = null;
    
    setTimeout(function () { ModelPicSize(); }, 500);

    $(addListModal).modal('hide');
    $(mmgTvSeriesModal).modal('show');
}