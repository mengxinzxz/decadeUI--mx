'use strict';
decadeModule.import(function (lib, game, ui, get, ai, _status) {
    decadeUI.changeCard = {

    };
    decadeUI.inheritChangeCard = {
        
    };

    if (!_status.connectMode) {
        for (var key in decadeUI.changeCard) {
            if (lib.card[key]) lib.card[key] = decadeUI.changeCard[key];
        }
        for (var key in decadeUI.inheritChangeCard) {
            if (lib.card[key]) {
                for (var j in decadeUI.inheritChangeCard[key]) {
                    lib.card[key][j] = decadeUI.inheritChangeCard[key][j];
                }
            }
        }
    }
});

