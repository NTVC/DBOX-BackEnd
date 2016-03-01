
/*##############################################################*/
// BANNER CONTENT FORM
dbox.controller('addContentModalController', function ($scope, genericService) {
    
    $scope.content = {};
    $scope.invokes = {};
    
    $scope.setInvokes = function () {
        
        genericService.json('homescreen/banners.invoke.json').then(function (data) {
            $scope.invokes = data;
        });
    };
    
    $scope.edit = function (content) {
        $scope.content = content;
        ModelPicSize();
        $(addContentModal).modal('show');
    };
    
    $scope.save = function () {
        
        if (validation()) {
            $scope.content.loader = true;

            $scope.content.save = true;
            $scope.content.banner_file = getFileUploud(contentBanner);

            // SAVE ON THE DATABASE
            genericService.form(pathContent, $scope.content, doneSaveContent);
        }
    };

    var validation = function () {
        
        var error = '';
        $scope.content.error = null;
        
        if (isNullorEmpty($scope.content.homebanners_id))
            error += errorTemplate('Id banner');
        if (isNullorEmpty($scope.content.banner))
            error += errorTemplate('Add a banner');
        if (isNullorEmpty($scope.content.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.content.error = error;
            return false;
        }
        else
            return true;
    };

    $scope.setInvokes();
});

function doneSaveContent(data) {

    getScope(addContentModal).content = null;
    getScope('container').loadAll();

    resetFileUploud(contentBanner);
    $(addContentModal).modal('hide');
}

function getListContent(data) {
    var s = getScope(addContentModal);
    
    s.lstContent = data;
    s.$apply();
}
