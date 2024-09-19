'use strict';
decadeModule.import(function (lib, game, ui, get, ai, _status) {
    decadeUI.animateSkill = {
        //涉及game.start自定义brawl模式无法播放开局动画，故搬运到此处做成技能播放
        mx_start: {
            trigger: { global: 'gameDrawAfter' },
            filter: function (event, player) {
                return lib.config.extension_十周年UI_gameAnimationEffect;
            },
            direct: true,
            priority: Infinity + 114514 + 1919810,
            firstDo: true,
            content: function () {
                game.removeGlobalSkill('mx_start');
                if (lib.config.extension_十周年UI_newDecadeStyle == 'on') {
                    game.playAudio('../extension', decadeUI.extensionName, 'audio/game_start.mp3');
                    var animation = decadeUI.animation;
                    var bounds = animation.getSpineBounds('effect_youxikaishi');
                    if (bounds == null) return;
                    var sz = bounds.size;
                    var scale = Math.min(animation.canvas.width / sz.x, animation.canvas.height / sz.y) * 0.76;
                    animation.playSpine({
                        name: 'effect_youxikaishi',
                        scale: scale
                    });
                }
                else {
                    game.playAudio('../extension', decadeUI.extensionName, 'audio/game_start_shousha.mp3');
                    var animation = decadeUI.animation;
                    var bounds = animation.getSpineBounds('effect_youxikaishi_shousha');
                    if (bounds == null) return;
                    var sz = bounds.size;
                    var scale = Math.min(animation.canvas.width / sz.x, animation.canvas.height / sz.y) * 1.5;
                    animation.playSpine({
                        name: 'effect_youxikaishi_shousha',
                        scale: scale
                    });
                }
            },
        },
        //龙头
        mx_longLevel: {
            trigger: {
                global: "gameStart"
            },
            silent: true,
            forced: true,
            filter: function (event, player) {
                return (lib.config.extension_十周年UI_longLevel == 'sex') || (lib.config.extension_十周年UI_longLevel == 'seven');
            },
            content: function () {
                game.removeGlobalSkill('mx_longLevel');
                game.players.forEach(target => {
                    if (lib.config.extension_十周年UI_longLevel == 'seven') {
                        var rarity = ['silver', 'gold', 'yu', 'bing', 'yan'];
                        switch (game.getRarity(player.name)) {
                            case 'junk': rarity = rarity[0]; break;
                            case 'common': rarity = rarity[1]; break;
                            case 'rare': rarity = rarity[2]; break;
                            case 'epic': rarity = rarity[3]; break;
                            case 'legend': rarity = rarity[4]; break;
                            default: break;
                        };
                    }
                    if (lib.config.extension_十周年UI_longLevel == 'sex') {
                        var rarity = ['silver', 'gold', 'yu', 'bing', 'yan'].randomGet();
                    };
                    var longtou = document.createElement("img");
                    longtou.src = decadeUIPath + "/assets/image/long_" + rarity + "1.png";
                    longtou.style.cssText = "pointer-events:none";
                    longtou.style.position = "absolute";
                    longtou.style.display = "block";
                    longtou.style.top = "-24px";
                    longtou.style.right = "-18px";
                    longtou.style.height = "110";
                    longtou.style.width = "60px";
                    longtou.style.zIndex = "63";
                    target.appendChild(longtou)

                    var longwei = document.createElement("img");
                    longwei.src = decadeUIPath + "/assets/image/long_" + rarity + "2.png";
                    longwei.style.cssText = "pointer-events:none";
                    longwei.style.position = "absolute";
                    longwei.style.display = "block";
                    longwei.style.bottom = "-10px";
                    longwei.style.right = "-9px";
                    longwei.style.height = "40";
                    longwei.style.width = "80px";
                    longwei.style.zIndex = "99";
                    target.appendChild(longwei);
                });
            }
        },
        //属性赋予
        decadeUI_usecardBegin: {
            trigger: { global: 'useCardBegin' },
            forced: true,
            popup: false,
            priority: -100,
            silent: true,
            filter: function (event) {
                return !ui.clear.delay && event.card.name != 'wuxie';
            },
            content: function () {
                ui.clear.delay = 'usecard';
            }
        },
        //击杀特效
        decadeUI_dieKillEffect: {
            trigger: { source: ['dieBegin'] },
            forced: true,
            popup: false,
            priority: -100,
            lastDo: true,
            silent: true,
            content: function () {
                if (!(trigger.source && trigger.player)) return;
                game.broadcastAll(function (source, player) {
                    if (!window.decadeUI) return;
                    if (!decadeUI.config.playerKillEffect) return;
                    decadeUI.effect.kill(source, player);
                }, trigger.source, trigger.player);
            },
        },
        //游戏开始分发手牌停顿
        decadeUI_gameDrawDelay: {
            trigger: { global: 'gameDrawBegin' },
            filter: function () {
                return !(_status.brawl && _status.brawl.noGameDraw);
            },
            priority: 100,
            firstDo: true,
            silent: true,
            forced: true,
            popup: false,
            content: function () {
                game.removeGlobalSkill('decadeUI_gameDrawDelay');
                decadeUI.delay(250);
            },
        },
        decadeUI_gameDrawDelayx: {
            trigger: { global: 'gameDrawEnd' },
            filter: function () {
                return !(_status.brawl && _status.brawl.noGameDraw);
            },
            priority: -100,
            lastDo: true,
            silent: true,
            forced: true,
            popup: false,
            content: function () {
                game.removeGlobalSkill('decadeUI_gameDrawDelayx');
                setTimeout(decadeUI.effect.gameStart, 51);
            },
        },
    };
    decadeUI.skill = {
        ghujia: {
            mark: false,
        },
        _usecard: {
            trigger: { global: 'useCardAfter' },
            forced: true,
            popup: false,
            silent: true,
            priority: -100,
            filter: function (event) {
                return ui.clear.delay === 'usecard' && event.card.name != 'wuxie';
            },
            content: function () {
                ui.clear.delay = false;
                game.broadcastAll(function () {
                    ui.clear();
                });
            }
        },
        _discard: {
            trigger: { global: ['discardAfter', 'loseToDiscardpileAfter', 'loseAsyncAfter'] },
            filter: function (event) {
                return ui.todiscard[event.discardid] ? true : false;
            },
            forced: true,
            silent: true,
            popup: false,
            priority: -100,
            content: function () {
                game.broadcastAll(function (id) {
                    if (window.decadeUI) {
                        ui.todiscard = [];
                        ui.clear();
                        return;
                    }
                    var todiscard = ui.todiscard[id];
                    delete ui.todiscard[id];
                    if (todiscard) {
                        var time = 1000;
                        if (typeof todiscard._discardtime == 'number') {
                            time += todiscard._discardtime - get.time();
                        }
                        if (time < 0) {
                            time = 0;
                        }
                        setTimeout(function () {
                            for (var i = 0; i < todiscard.length; i++) {
                                todiscard[i].delete();
                            }
                        }, time);
                    }
                }, trigger.discardid);
            }
        },
        chengxiang: {
            audio: 2,
            frequent: true,
            trigger: {
                player: 'damageEnd'
            },
            content: function () {
                'step 0';
                var chengxiangNum = (event.name == 'oldchengxiang' ? 12 : 13);
                var mark = 0;
                if (event.name == "olchengxiang") {
                    mark += player.countMark("olchengxiang");
                    player.removeMark("olchengxiang", mark, false);
                }
                var cards = get.cards(4 + mark);
                var guanXing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 4, false);
                guanXing.doubleSwitch = true;
                guanXing.caption = '【称象】';
                guanXing.header2 = '获得的牌';
                guanXing.callback = function () {
                    var num = 0;
                    for (var i = 0; i < this.cards[1].length; i++) {
                        num += get.number(this.cards[1][i]);
                    }

                    return num > 0 && num <= chengxiangNum;
                };

                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var guanXing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 4, false);
                    guanXing.caption = '【称象】';
                    guanXing.header2 = '获得的牌';
                    guanXing.callback = callback;
                }, player, cards, guanXing.callback);

                var player = event.player;
                event.switchToAuto = function () {
                    var cards = guanXing.cards[0];
                    var num, sum, next;
                    var index = 0;
                    var results = [];

                    for (var i = 0; i < cards.length; i++) {
                        num = 0;
                        sum = 0;
                        next = i + 1;
                        for (var j = i; j < cards.length; j++) {
                            if (j != i && j < next)
                                continue;

                            num = sum + get.number(cards[j]);
                            if (num <= chengxiangNum) {
                                sum = num;
                                if (!results[index]) results[index] = [];
                                results[index].push(cards[j]);
                            }

                            if (j >= cards.length - 1) index++;
                        }

                        if (results[index] && results[index].length == cards.length) break;
                    }

                    var costs = [];
                    for (var i = 0; i < results.length; i++) {
                        costs[i] = {
                            value: 0,
                            index: i
                        };
                        for (var j = 0; j < results[i].length; j++) {
                            costs[i].value += get.value(results[i][j], player);
                            // 如果有队友且有【仁心】且血量不低，优先选择装备牌
                            if (player.hasFriend() && player.hasSkill('renxin') && get.type(results[i][j]) == 'equip' && player.hp > 1) {
                                costs[i].value += 5;
                            }

                            // 如果自己有延时牌且没有无懈可击，优先选择无懈可击
                            if (player.node.judges.childNodes.length > 0 && !player.hasWuxie() && results[i][j] == 'wuxie') {
                                costs[i].value += 5;
                            }
                        }
                    }

                    costs.sort(function (a, b) {
                        return b.value - a.value;
                    });

                    var time = 500;
                    var result = results[costs[0].index];

                    for (var i = 0; i < result.length; i++) {
                        setTimeout(function (move, finished) {
                            guanXing.move(move, guanXing.cards[1].length, 1);
                            if (finished) guanXing.finishTime(1000);
                        }, time, result[i], (i >= result.length - 1));
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }
                'step 1';
                if (event.result && event.result.bool) {
                    game.cardsDiscard(event.cards1);
                    var cards2 = event.cards2;
                    player.gain(cards2, "gain2");
                    if (event.name == "olchengxiang") {
                        let num = cards2.reduce((num, i) => {
                            return num + get.number(i, player);
                        }, 0);
                        if (num == 13) player.addMark("olchengxiang", 1, false);
                    }
                }
            },
            ai: {
                maixie: true,
                maixie_hp: true,
                effect: {
                    target: function (card, player, target) {
                        if (get.tag(card, 'damage')) {
                            if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                            if (!target.hasFriend()) return;
                            if (target.hp >= 4) return [1, 2];
                            if (target.hp == 3) return [1, 1.5];
                            if (target.hp == 2) return [1, 0.5];
                        }
                    }
                }
            }
        },
        xinfu_zuilun: {
            audio: 2,
            trigger: {
                player: 'phaseJieshuBegin'
            },
            check: function (event, player) {
                var num = 0;
                if (player.getHistory('lose', function (evt) {
                    return evt.type == 'discard';
                }).length) num++;
                if (!player.isMinHandcard()) num++;
                if (!player.getStat('damage')) num++;
                if (num == 3) return player.hp >= 2;
                return true;
            },
            prompt: function (event, player) {
                var num = 3;
                if (player.getHistory('lose', function (evt) {
                    return evt.type == 'discard';
                }).length) num--;
                if (!player.isMinHandcard()) num--;
                if (!player.getStat('damage')) num--;
                return get.prompt('xinfu_zuilun') + '（可获得' + get.cnNumber(num) + '张牌）';
            },
            content: function () {
                'step 0';
                event.num = 0;
                event.cards = get.cards(3);
                if (player.getHistory('lose', function (evt) {
                    return evt.type == 'discard';
                }).length) event.num++;
                if (!player.isMinHandcard()) event.num++;
                if (!player.getStat('damage')) event.num++;
                'step 1';
                if (event.num == 0) {
                    player.gain(event.cards, 'draw');
                    event.finish();
                    return;
                }

                var cards = event.cards;
                var gains = cards.length - event.num;

                var zuiLun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, gains);
                zuiLun.caption = '【罪论】';
                zuiLun.header2 = '获得的牌';
                zuiLun.tip = '可获得' + gains + '张牌<br>' + zuiLun.tip;
                zuiLun.callback = function () {
                    return this.cards[1].length == gains;
                };

                game.broadcast(function (player, cards, gains, callback) {
                    if (!window.decadeUI) return;
                    var zuiLun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, gains);
                    zuiLun.caption = '【罪论】';
                    zuiLun.header2 = '获得的牌';
                    zuiLun.tip = '可获得' + gains + '张牌<br>' + zuiLun.tip;
                    zuiLun.callback = callback;
                }, player, cards, gains, zuiLun.callback);

                var player = event.player;
                event.switchToAuto = function () {
                    var cheats = [];
                    var cards = zuiLun.cards[0].concat();
                    var stopped = false;

                    var next = player.getNext();
                    var hasFriend = get.attitude(player, next) > 0;

                    // 判断下家是不是队友，令其生效或者失效
                    var judges = next.node.judges.childNodes;
                    if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, hasFriend);

                    // 如果有【父荫】优先把好牌给队友
                    if (hasFriend && player.hasSkill('xinfu_fuyin')) {
                        cards = decadeUI.get.bestValueCards(cards, next);
                    } else {
                        cards.sort(function (a, b) {
                            return get.value(a, player) - get.value(b, player);
                        });
                    }

                    cards = cheats.concat(cards);
                    var time = 500;
                    var gainNum = gains;
                    for (var i = cards.length - 1; i >= 0; i--) {
                        setTimeout(function (card, index, finished, moveDown) {
                            zuiLun.move(card, index, moveDown ? 1 : 0);
                            if (finished) zuiLun.finishTime(1000);
                        }, time, cards[i], i, i == 0, gainNum > 0);
                        time += 500;
                        gainNum--;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }
                'step 2';
                event.cards = event.cards2;
                if (event.result && event.result.bool) {
                    var cards = event.cards1;
                    var first = ui.cardPile.firstChild;
                    for (var i = 0; i < cards.length; i++) {
                        ui.cardPile.insertBefore(cards[i], first);
                    }
                }
                'step 3';
                game.updateRoundNumber();
                if (event.cards.length) {
                    player.gain(event.cards, 'draw');
                    event.finish();
                } else {
                    player.chooseTarget('请选择一名角色，与其一同失去1点体力', true, function (card, player, target) {
                        return target != player;
                    }).ai = function (target) {
                        return -get.attitude(_status.event.player, target);
                    };
                }
                'step 4';
                player.line(result.targets[0], 'fire');
                player.loseHp();
                result.targets[0].loseHp();
            }
        },
        xunxun: {
            audio: 2,
            trigger: {
                player: 'phaseDrawBegin1'
            },
            content: function () {
                'step 0';
                var cards = get.cards(4);
                var player = event.player;
                var xunxun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 2);
                xunxun.caption = '【恂恂】';
                xunxun.header1 = '牌堆底';
                xunxun.header2 = '牌堆顶';
                xunxun.callback = function () {
                    return this.cards[0].length == 2 && this.cards[1].length == 2;
                };

                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var xunxun = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 2);
                    xunxun.caption = '【恂恂】';
                    xunxun.header1 = '牌堆底';
                    xunxun.header2 = '牌堆顶';
                    xunxun.callback = callback;
                }, player, cards, xunxun.callback);

                event.switchToAuto = function () {
                    var cards = decadeUI.get.bestValueCards(xunxun.cards[0].concat(), player);
                    var time = 500;
                    for (var i = 0; i < 2; i++) {
                        setTimeout(function (card, index, finished) {
                            xunxun.move(card, index, 1);
                            if (finished) xunxun.finishTime(1000);
                        }, time, cards[i], i, i >= 1);
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }

                'step 1';
                var first = ui.cardPile.firstChild;
                var cards = event.cards2;
                for (var i = 0; i < cards.length; i++) {
                    ui.cardPile.insertBefore(cards[i], first);
                }

                cards = event.cards1;
                for (var i = 0; i < cards.length; i++) {
                    ui.cardPile.appendChild(cards[i]);
                }
            }

        },

        xinfu_dianhua: {
            audio: 2,
            frequent: true,
            trigger: {
                player: ["phaseZhunbeiBegin", "phaseJieshuBegin"]
            },
            filter: function (event, player) {
                for (var i = 0; i < lib.suit.length; i++) {
                    if (player.hasMark('xinfu_falu_' + lib.suit[i])) return true;
                }
                return false;
            },
            content: function () {
                'step 0';
                var num = 0;
                var player = event.player;
                for (var i = 0; i < lib.suit.length; i++) {
                    if (player.hasMark('xinfu_falu_' + lib.suit[i])) num++;
                }

                var cards = get.cards(num);
                var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                dialog.caption = '【点化】';
                game.broadcast(function (player, cards) {
                    if (!window.decadeUI) return;
                    decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length).caption = '【点化】';
                }, player, cards);

                event.switchToAuto = function () {
                    var cheats = [];
                    var cards = dialog.cards[0].concat();
                    var judges;

                    var next = player.getNext();
                    var friend = player;
                    if (event.triggername == 'phaseJieshuBegin') {
                        friend = next;
                        judges = friend.node.judges.childNodes;
                        if (get.attitude(player, friend) < 0) friend = null;
                    } else {
                        judges = player.node.judges.childNodes;
                    }

                    if (judges.length) {
                        cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);
                    }

                    if (cards.length && cheats.length == judges.length) {
                        for (var i = 0; i >= 0 && i < cards.length; i++) {
                            if (friend) {
                                if (get.value(cards[i], friend) >= 5) {
                                    cheats.push(cards[i]);
                                    cards.splice(i, 1);
                                }
                            } else {
                                if (get.value(cards[i], next) < 4) {
                                    cheats.push(cards[i]);
                                    cards.splice(i, 1);
                                }
                            }
                        }
                    }

                    var time = 500;
                    for (var i = 0; i < cheats.length; i++) {
                        setTimeout(function (card, index, finished) {
                            dialog.move(card, index, 0);
                            if (finished) dialog.finishTime(1000);
                        }, time, cheats[i], i, (i >= cheats.length - 1) && cards.length == 0);
                        time += 500;
                    }

                    for (var i = 0; i < cards.length; i++) {
                        setTimeout(function (card, index, finished) {
                            dialog.move(card, index, 1);
                            if (finished) dialog.finishTime(1000);
                        }, time, cards[i], i, (i >= cards.length - 1));
                        time += 500;
                    }
                };
                // var dianhua = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                // dianhua.caption = '【点化】';
                // game.broadcast(function(player, cards, callback){
                // if (!window.decadeUI) return;
                // var dianhua = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                // dianhua.caption = '【点化】';
                // dianhua.callback = callback;
                // }, player, cards, dianhua.callback);

                // event.switchToAuto = function(){
                // var cards = dianhua.cards[0].concat();
                // var cheats = [];
                // var judges;

                // var next = player.getNext();
                // var friend = player;
                // if (event.triggername == 'phaseJieshuBegin') {
                // friend = next;
                // judges = friend.node.judges.childNodes;
                // if (get.attitude(player, friend) < 0) friend = null;
                // } else {
                // judges = player.node.judges.childNodes;
                // }

                // if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);

                // if (friend) {
                // cards = decadeUI.get.bestValueCards(cards, friend);
                // } else {
                // cards.sort(function(a, b){
                // return get.value(a, next) - get.value(b, next);
                // });
                // }

                // cards = cheats.concat(cards);
                // var time = 500;
                // for (var i = 0; i < cards.length; i++) {
                // setTimeout(function(card, index, finished){
                // dianhua.move(card, index, 0);
                // if (finished) dianhua.finishTime(1000);
                // }, time, cards[i], i, i >= cards.length - 1);
                // time += 500;
                // }
                // }

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }

                'step 1';
                player.popup(get.cnNumber(event.num1) + '上' + get.cnNumber(event.num2) + '下');
                game.log(player, '将' + get.cnNumber(event.num1) + '张牌置于牌堆顶，' + get.cnNumber(event.num2) + '张牌置于牌堆底');
                game.updateRoundNumber();
            }

        },
        zongxuan: {
            audio: 2,
            frequent: false,
            trigger: {
                player: 'loseAfter'
            },
            check: function (event) {
                var cards = [];
                for (var i = 0; i < event.cards2.length; i++) {
                    if (get.position(event.cards2[i]) == 'd') {
                        cards.push(event.cards2[i]);
                    }
                }

                var player = event.player;

                if (_status.currentPhase == player) {
                    for (var i = 0; i < cards.length; i++) {
                        if (get.value(cards[i], event.player) > 4) return true;
                    }
                } else if (_status.currentPhase) {
                    var next = _status.currentPhase.getNext();
                    var judges = next.node.judges.childNodes;
                    if (get.attitude(player, next) > 0) {
                        if (judges.length > 0) {
                            for (var j = 0; j < judges.length; j++) {
                                var judge = get.judge(judges[j]);
                                for (var i = 0; i < cards.length; i++) {
                                    if (judge(cards[i]) >= 0) return true;
                                }
                            }
                        } else {
                            for (var i = 0; i < cards.length; i++) if (get.value(cards[i], next) > 4) return true;
                        }
                    } else {
                        if (judges.length > 0) {
                            for (var j = 0; j < judges.length; j++) {
                                var judge = get.judge(judges[j]);
                                for (var i = 0; i < cards.length; i++) {
                                    if (judge(cards[i]) < 0) return true;
                                }
                            }
                        } else {
                            for (var i = 0; i < cards.length; i++) if (get.value(cards[i], next) < 4) return true;
                        }

                    }
                }

                return false;
            },
            filter: function (event, player) {
                if (event.type != 'discard') return false;
                for (var i = 0; i < event.cards2.length; i++) {
                    if (get.position(event.cards2[i]) == 'd') {
                        return true;
                    }
                }
                return false;
            },
            content: function () {
                'step 0';
                var cards = [];
                for (var i = 0; i < trigger.cards2.length; i++) {
                    var card = trigger.cards2[i];
                    if (get.position(card, true) == 'd') {
                        cards.push(card);
                        clearTimeout(card.timeout);
                        card.classList.remove('removing');
                        // 防止因为限制结算速度，而导致牌提前进入弃牌堆
                    }
                }

                if (!cards.length) return;
                var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                dialog.caption = '【纵玄】';
                dialog.header1 = '弃牌堆';
                dialog.header2 = '牌堆顶';
                dialog.lockCardsOrder(0);
                dialog.callback = function () {
                    return this.cards[1].length > 0;
                };
                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var zongxuan = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                    dialog.caption = '【纵玄】';
                    dialog.header1 = '弃牌堆';
                    dialog.header2 = '牌堆顶';
                    dialog.lockCardsOrder(0);
                    dialog.callback = callback;
                }, player, cards, dialog.callback);

                event.switchToAuto = function () {
                    var parent = event.parent;
                    while (parent != null && parent.name != 'phaseDiscard') parent = parent.parent;

                    var cards = dialog.cards[0].concat();
                    var cheats = [];
                    var next = player.getNext();
                    var hasFriend = get.attitude(player, next) > 0;

                    if (parent) {
                        var hasZhiYan = player.hasSkill('zhiyan');	//如果有【直言】，AI 1000%肯定会用这个技能
                        var judges = next.node.judges.childNodes;
                        if (judges > 0 && hasZhiYan && cards.length > 1) {
                            cheats = decadeUI.get.cheatJudgeCards(cards, judges, hasFriend);
                        }
                    }

                    if (cards.length > 0) {
                        cards.sort(function (a, b) {
                            return get.value(b, player) - get.value(a, player);
                        });
                        cheats.splice(0, 0, cards.shift());

                        var cost;
                        for (var i = 0; i < cards.length; i++) {
                            if (hasFriend) {
                                if (get.value(cards[i], next) >= 5) cheats.push(cards[i]);
                            } else {
                                if (get.value(cards[i], next) < 5) cheats.push(cards[i]);
                            }
                        }
                    }

                    var time = 500;
                    for (var i = 0; i < cheats.length; i++) {
                        setTimeout(function (card, index, finished) {
                            dialog.move(card, index, 1);
                            if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);
                            ;
                        }, time, cheats[i], i, (i >= cheats.length - 1));
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }

                'step 1';
                var first = ui.cardPile.firstChild;
                var cards = event.cards2;
                for (var i = 0; i < cards.length; i++) {
                    ui.cardPile.insertBefore(cards[i], first);
                }

                cards = event.cards1;
                for (var i = 0; i < cards.length; i++) {
                    ui.discardPile.appendChild(cards[i]);
                }

                game.log(player, '将' + get.cnNumber(event.num2) + '张牌置于牌堆顶');
            }
        },
        identity_junshi: {
            name: '军师',
            mark: true,
            silent: true,
            intro: { content: '准备阶段开始时，可以观看牌堆顶的三张牌，然后将这些牌以任意顺序置于牌堆顶或牌堆底' },
            trigger: {
                player: 'phaseBegin'
            },
            content: function () {
                "step 0";
                if (player.isUnderControl()) {
                    game.modeSwapPlayer(player);
                }
                var num = 3;
                var cards = get.cards(num);
                var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                guanxing.caption = '【军师】';
                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                    guanxing.caption = '【军师】';
                    guanxing.callback = callback;
                }, player, cards, guanxing.callback);

                event.switchToAuto = function () {
                    var cards = guanxing.cards[0].concat();
                    var cheats = [];
                    var judges = player.node.judges.childNodes;

                    if (judges.length) cheats = decadeUI.get.cheatJudgeCards(cards, judges, true);
                    if (cards.length) {
                        for (var i = 0; i >= 0 && i < cards.length; i++) {
                            if (get.value(cards[i], player) >= 5) {
                                cheats.push(cards[i]);
                                cards.splice(i, 1);
                            }
                        }
                    }

                    var time = 500;
                    for (var i = 0; i < cheats.length; i++) {
                        setTimeout(function (card, index, finished) {
                            guanxing.move(card, index, 0);
                            if (finished) guanxing.finishTime(1000);
                        }, time, cheats[i], i, (i >= cheats.length - 1) && cards.length == 0);
                        time += 500;
                    }

                    for (var i = 0; i < cards.length; i++) {
                        setTimeout(function (card, index, finished) {
                            guanxing.move(card, index, 1);
                            if (finished) guanxing.finishTime(1000);
                        }, time, cards[i], i, (i >= cards.length - 1));
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }
                "step 1";
                player.popup(get.cnNumber(event.num1) + '上' + get.cnNumber(event.num2) + '下');
                game.log(player, '将' + get.cnNumber(event.num1) + '张牌置于牌堆顶，' + get.cnNumber(event.num2) + '张牌置于牌堆底');
                game.updateRoundNumber();
            }
        },
        wuxin: {
            audio: 2,
            trigger: {
                player: 'phaseDrawBegin1'
            },
            content: function () {
                var num = get.population('qun');
                if (player.hasSkill('huangjintianbingfu')) {
                    num += player.getExpansions('huangjintianbingfu').length;
                }

                var cards = get.cards(num);
                var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                dialog.caption = '【悟心】';
                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                    dialog.caption = '【悟心】';
                    dialog.callback = callback;
                }, player, cards, dialog.callback);

                event.switchToAuto = function () {
                    var cards = dialog.cards[0].concat();
                    var cheats = [];

                    var next = player.getNext();
                    var friend = player;
                    var judges = friend.node.judges.childNodes;
                    if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);

                    if (friend) {
                        cards = decadeUI.get.bestValueCards(cards, friend);
                    } else {
                        cards.sort(function (a, b) {
                            return get.value(a, next) - get.value(b, next);
                        });
                    }

                    cards = cheats.concat(cards);
                    var time = 500;
                    for (var i = 0; i < cards.length; i++) {
                        setTimeout(function (card, index, finished) {
                            dialog.move(card, index, 0);
                            if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);
                            ;
                        }, time, cards[i], i, i >= cards.length - 1);
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }
            }
        },
        luoying: {
            group: ['luoying_discard', 'luoying_judge'],
            subfrequent: ['judge'],
            subSkill: {
                discard: {
                    audio: 2,
                    trigger: {
                        global: 'loseAfter'
                    },
                    filter: function (event, player) {
                        if (event.type != 'discard') return false;
                        if (event.player == player) return false;
                        for (var i = 0; i < event.cards2.length; i++) {
                            if (get.suit(event.cards2[i], event.player) == 'club' && get.position(event.cards2[i], true) == 'd') {
                                return true;
                            }
                        }
                        return false;
                    },
                    // direct: true,
                    content: function () {
                        "step 0";
                        if (trigger.delay == false) game.delay();
                        "step 1";
                        var cards = [];
                        for (var i = 0; i < trigger.cards2.length; i++) {
                            var card = trigger.cards2[i];
                            if (get.suit(card, trigger.player) == 'club' && get.position(card, true) == 'd') {
                                cards.push(card);
                                clearTimeout(card.timeout);
                                card.classList.remove('removing');
                                // 防止因为限制结算速度，而导致牌提前进入弃牌堆
                            }
                        }

                        var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length, false);
                        dialog.caption = '【落英】';
                        dialog.header1 = '弃牌堆';
                        dialog.header2 = '获得牌';
                        dialog.tip = '请选择要获得的牌';
                        dialog.lockCardsOrder(0);
                        dialog.cards[1] = dialog.cards[0];
                        dialog.cards[0] = [];
                        dialog.update();
                        dialog.onMoved();
                        dialog.callback = function () {
                            return true;
                        };
                        game.broadcast(function (player, cards, callback) {
                            if (!window.decadeUI) return;
                            var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length, false);
                            dialog.caption = '【落英】';
                            dialog.header1 = '弃牌堆';
                            dialog.header2 = '获得牌';
                            dialog.tip = '请选择要获得的牌';
                            dialog.lockCardsOrder(0);
                            dialog.cards[1] = dialog.cards[0];
                            dialog.cards[0] = [];
                            dialog.update();
                            dialog.onMoved();
                            dialog.callback = callback;
                        }, player, cards, dialog.callback);

                        event.switchToAuto = function () {
                            var cards = dialog.cards[1].concat();
                            var time = 500;

                            if (cards.length) {
                                var discards = [];
                                for (var i = 0; i < cards.length; i++) {
                                    if (get.value(cards[i]) < 0) {
                                        discards.push(cards[i]);
                                    }
                                }

                                if (discards.length) {
                                    for (var i = 0; i < discards.length; i++) {
                                        setTimeout(function (card, index, finished) {
                                            dialog.move(card, index, 0);
                                            if (finished) dialog.finishTime(1000);
                                        }, time, discards[i], i, i >= discards.length - 1);
                                        time += 500;
                                    }
                                } else {
                                    dialog.finishTime(1000);
                                }

                            } else {
                                dialog.finishTime(1000);
                            }
                        };

                        if (event.isOnline()) {
                            event.player.send(function () {
                                if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                            }, event.player);

                            event.player.wait();
                            decadeUI.game.wait();
                        } else if (!event.isMine()) {
                            event.switchToAuto();
                        }
                        "step 2";
                        game.cardsDiscard(event.cards1);
                        if (event.cards2) {
                            // player.logSkill(event.name);
                            player.gain(event.cards2, 'gain2', 'log');
                        }
                    }
                },
                judge: {
                    audio: 2,
                    trigger: {
                        global: 'cardsDiscardAfter'
                    },
                    // direct: true,
                    check: function (event, player) {
                        return event.cards[0].name != 'du';
                    },
                    filter: function (event, player) {
                        var evt = event.getParent().relatedEvent;
                        if (!evt || evt.name != 'judge') return;
                        if (evt.player == player) return false;
                        if (get.position(event.cards[0], true) != 'd') return false;
                        return (get.suit(event.cards[0]) == 'club');
                    },
                    content: function () {
                        "step 0";
                        var cards = trigger.cards;

                        var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length, false);
                        dialog.caption = '【落英】';
                        dialog.header1 = '弃牌堆';
                        dialog.header2 = '获得牌';
                        dialog.tip = '请选择要获得的牌';
                        dialog.lockCardsOrder(0);
                        dialog.callback = function () {
                            return true;
                        };
                        game.broadcast(function (player, cards, callback) {
                            if (!window.decadeUI) return;
                            var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length, false);
                            dialog.caption = '【落英】';
                            dialog.header1 = '弃牌堆';
                            dialog.header2 = '获得牌';
                            dialog.tip = '请选择要获得的牌';
                            dialog.lockCardsOrder(0);
                            dialog.callback = callback;
                        }, player, cards, dialog.callback);

                        event.switchToAuto = function () {
                            var cards = dialog.cards[0].concat();
                            var time = 500;
                            for (var i = 0; i < cards.length; i++) {
                                if (get.value(cards[i], player) < 0) continue;
                                setTimeout(function (card, index, finished) {
                                    dialog.move(card, index, 1);
                                    if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);
                                    ;
                                }, time, cards[i], i, i >= cards.length - 1);
                                time += 500;
                            }
                        };

                        if (event.isOnline()) {
                            event.player.send(function () {
                                if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                            }, event.player);

                            event.player.wait();
                            decadeUI.game.wait();
                        } else if (!event.isMine()) {
                            event.switchToAuto();
                        }
                        "step 1";
                        game.cardsDiscard(event.cards1);
                        if (event.cards2) {
                            // player.logSkill(event.name);
                            player.gain(event.cards2, 'gain2', 'log');
                        }
                    }
                }
            }
        }
    };

    decadeUI.inheritSkill = {
        xinfu_pingcai: {
            contentx: function () {
                "step 0"
                event.pingcai_delayed = true;
                var name = lib.skill.xinfu_pingcai_backup.takara;
                event.cardname = name;
                event.videoId = lib.status.videoId++;
                if (player.isUnderControl()) {
                    game.swapPlayerAuto(player);
                }
                var switchToAuto = function () {
                    game.pause();
                    game.countChoose();
                    event.timeout = setTimeout(function () {
                        _status.imchoosing = false;
                        event._result = {
                            bool: true,
                        };
                        game.resume();
                    }, 9000);
                };
                var createDialog = function (player, id, name) {
                    if (player == game.me) return;
                    var dialog = ui.create.dialog('forcebutton', 'hidden');
                    var str = get.translation(player) + '正在擦拭宝物上的灰尘…';
                    var canSkip = (!_status.connectMode);
                    if (canSkip) str += '<br>（点击宝物可以跳过等待AI操作）';
                    dialog.textPrompt = dialog.add('<div class="text center">' + str + '</div>');
                    dialog.classList.add('fixed');
                    dialog.classList.add('scroll1');
                    dialog.classList.add('scroll2');
                    dialog.classList.add('fullwidth');
                    dialog.classList.add('fullheight');
                    dialog.classList.add('noupdate');
                    dialog.videoId = id;

                    var canvas2 = document.createElement('canvas');
                    dialog.canvas_viewer = canvas2;
                    dialog.appendChild(canvas2);
                    canvas2.classList.add('grayscale');
                    canvas2.style.position = "absolute";
                    canvas2.style.width = '249px';
                    canvas2.style.height = '249px';
                    canvas2.style['border-radius'] = '6px';
                    canvas2.style.left = "calc(50% - 125px)";
                    canvas2.style.top = "calc(50% - 125px)";
                    canvas2.width = 249;
                    canvas2.height = 249;
                    canvas2.style.border = '3px solid';

                    var ctx2 = canvas2.getContext('2d');
                    var img = new Image();
                    img.src = lib.assetURL + 'image/card/' + name + '.png';
                    img.onload = function () {
                        ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
                    }
                    if (canSkip) {
                        var skip = function () {
                            if (event.pingcai_delayed) {
                                delete event.pingcai_delayed;
                                clearTimeout(event.timeout);
                                event._result = {
                                    bool: true,
                                };
                                game.resume();
                                canvas2.removeEventListener(lib.config.touchscreen ? 'touchend' : 'click', skip);
                            }
                        };
                        canvas2.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', skip);
                    }
                    dialog.open();
                };
                var chooseButton = function (id, name) {
                    var event = _status.event;
                    _status.xinfu_pingcai_finished = false;

                    var dialog = ui.create.dialog('forcebutton', 'hidden');
                    dialog.textPrompt = dialog.add('<div class="text center">擦拭掉宝物上的灰尘吧！</div>');
                    event.switchToAuto = function () {
                        event._result = {
                            bool: _status.xinfu_pingcai_finished,
                        };
                        game.resume();
                        _status.imchoosing = false;
                        _status.xinfu_pingcai_finished = true;
                    };
                    dialog.classList.add('fixed');
                    dialog.classList.add('scroll1');
                    dialog.classList.add('scroll2');
                    dialog.classList.add('fullwidth');
                    dialog.classList.add('fullheight');
                    dialog.classList.add('noupdate');
                    dialog.videoId = id;

                    var canvas = document.createElement('canvas');
                    var canvas2 = document.createElement('canvas');

                    dialog.appendChild(canvas2);
                    dialog.appendChild(canvas);

                    canvas.style.position = "absolute";
                    canvas.style.width = '249px';
                    canvas.style.height = '249px';
                    canvas.style['border-radius'] = '6px';
                    canvas.style.left = "calc(50% - 125px)";
                    canvas.style.top = "calc(50% - 125px)";
                    canvas.width = 249;
                    canvas.height = 249;
                    canvas.style.border = '3px solid';

                    canvas2.style.position = "absolute";
                    canvas2.style.width = '249px';
                    canvas2.style.height = '249px';
                    canvas2.style['border-radius'] = '6px';
                    canvas2.style.left = "calc(50% - 125px)";
                    canvas2.style.top = "calc(50% - 125px)";
                    canvas2.width = 249;
                    canvas2.height = 249;
                    canvas2.style.border = '3px solid';

                    var ctx = canvas.getContext('2d');
                    var ctx2 = canvas2.getContext('2d');

                    var img = new Image();
                    img.src = lib.assetURL + 'image/card/' + name + '.png';
                    img.onload = function () {
                        ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
                    }

                    ctx.fillStyle = 'lightgray';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    canvas.onmousedown = function (ev) {
                        //if(_status.xinfu_pingcai_finished) return;
                        canvas.onmousemove = function (e) {
                            if (_status.xinfu_pingcai_finished) return;
                            ctx.beginPath();
                            ctx.clearRect(e.offsetX / game.documentZoom - 16, e.offsetY / game.documentZoom - 16, 32, 32);
                            var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
                            var sum = 0;
                            for (var i = 3; i < data.length; i += 4) {
                                if (data[i] == 0) {
                                    sum++;
                                }
                            }
                            if (sum >= (canvas.width * canvas.height) * 0.6) {
                                //ctx.clearRect(0,0,canvas.width,canvas.height);
                                if (!_status.xinfu_pingcai_finished) {
                                    _status.xinfu_pingcai_finished = true;
                                    event.switchToAuto();
                                }
                            }
                        }
                    }
                    canvas.ontouchstart = function (ev) {
                        //if(_status.xinfu_pingcai_finished) return;
                        canvas.ontouchmove = function (e) {
                            if (_status.xinfu_pingcai_finished) return;
                            ctx.beginPath();
                            var rect = canvas.getBoundingClientRect();
                            var X = ((e.touches[0].clientX / game.documentZoom - rect.left) / rect.width * canvas.width);
                            var Y = ((e.touches[0].clientY / game.documentZoom - rect.top) / rect.height * canvas.height);
                            ctx.clearRect(X - 16, Y - 16, 32, 32);
                            var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
                            var sum = 0;
                            for (var i = 3; i < data.length; i += 4) {
                                if (data[i] == 0) {
                                    sum++;
                                }
                            }
                            if (sum >= (canvas.width * canvas.height) * 0.6) {
                                if (!_status.xinfu_pingcai_finished) {
                                    _status.xinfu_pingcai_finished = true;
                                    event.switchToAuto();
                                }
                            }
                        }
                    }
                    canvas.onmouseup = function (ev) {
                        canvas.onmousemove = null;
                    }
                    canvas.ontouchend = function (ev) {
                        canvas.ontouchmove = null;
                    }

                    dialog.open();

                    game.pause();
                    game.countChoose();
                };
                //event.switchToAuto=switchToAuto;
                game.broadcastAll(createDialog, player, event.videoId, name);
                if (event.isMine()) {
                    chooseButton(event.videoId, name);
                }
                else if (event.isOnline()) {
                    event.player.send(chooseButton, event.videoId, name);
                    event.player.wait();
                    game.pause();
                }
                else {
                    switchToAuto();
                }
                "step 1"
                var result = event.result || result;
                if (!result) result = { bool: false };
                event._result = result;
                game.broadcastAll(function (id, result, player) {
                    _status.xinfu_pingcai_finished = true;
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        dialog.textPrompt.innerHTML = '<div class="text center">' + (get.translation(player) + '擦拭宝物' + (result.bool ? '成功！' : '失败…')) + '</div>';
                        if (result.bool && dialog.canvas_viewer) dialog.canvas_viewer.classList.remove('grayscale');
                    }
                    if (!_status.connectMode) delete event.pingcai_delayed;
                }, event.videoId, result, player);
                game.delay(2.5);
                "step 2"
                game.broadcastAll('closeDialog', event.videoId);
                if (result.bool) {
                    player.logSkill('pcaudio_' + event.cardname);
                    event.insert(lib.skill.xinfu_pingcai[event.cardname], {
                        player: player,
                    });
                }
            },
            ai: {
                order: 7,
                fireAttack: true,
                threaten: 1.7,
                result: {
                    player: 1,
                },
            },
        },
        xz_xunxun: {
            audio: 2,
            trigger: {
                player: 'phaseDrawBegin1'
            },
            filter: function (event, player) {
                var num = game.countPlayer(function (current) {
                    return current.isDamaged();
                });
                return num >= 1 && !player.hasSkill('xunxun');
            },
            content: decadeUI.skill.xunxun.content
        },
        reluoying: {
            subSkill: {
                discard: {
                    audio: 'reluoying',
                    audionamr: ['dc_caozhi'],
                    trigger: {
                        global: 'loseAfter'
                    },
                    filter: decadeUI.skill.luoying.subSkill.discard.filter,
                    // direct: true,
                    content: decadeUI.skill.luoying.subSkill.discard.content
                },
                judge: {
                    audio: 'reluoying',
                    audionamr: ['dc_caozhi'],
                    trigger: {
                        global: 'cardsDiscardAfter'
                    },
                    // direct: true,
                    check: decadeUI.skill.luoying.subSkill.judge.check,
                    filter: decadeUI.skill.luoying.subSkill.judge.filter,
                    content: decadeUI.skill.luoying.subSkill.judge.content
                }
            }
        },
        dddfenye: {
            $compareFenye: function (players, cards1, targets, cards2) {
                game.broadcast(function (players, cards1, targets, cards2) {
                    lib.skill.dddfenye.$compareFenye(players, cards1, targets, cards2);
                }, players, cards1, targets, cards2);
                game.addVideo('compareFenye', [get.targetsInfo(players), get.cardsInfo(cards1), get.targetsInfo(targets), get.cardsInfo(cards2)]);
                for (var i = players.length - 1; i >= 0; i--) {
                    players[i].$throwordered2(cards1[i].copy(false));
                }
                for (var i = targets.length - 1; i >= 0; i--) {
                    targets[i].$throwordered2(cards2[i].copy(false));
                }
            },
        },
        huashen: {
            async content(event, trigger, player) {
                const map = event.cost_data;
                if (!map.logged) player.logSkill("huashen");
                const skill = map.skill,
                    character = map.character;
                if (character != player.storage.huashen.current) {
                    const old = player.storage.huashen.current;
                    player.storage.huashen.current = character;
                    player.markSkill("huashen");
                    game.broadcastAll(function (player, character, old) {
                        player.tempname.remove(old);
                        player.tempname.add(character);
                        player.sex = lib.character[character].sex;
                        //player.group=lib.character[character][1];
                        //player.node.name.dataset.nature=get.groupnature(player.group);
                        const mark = player.marks.huashen;
                        if (mark) {
                            mark.setBackground(character, 'character');
                            mark._name = character;
                            mark.style.setProperty('background-size', 'cover', 'important');
                            mark.text.style.setProperty('font-size', '0px', 'important');
                        }
                    }, player, character, old);
                    game.log(player, "将性别变为了", "#y" + get.translation(lib.character[character].sex) + "性");
                    await player.changeGroup(lib.character[character].group);
                }
                player.storage.huashen.current2 = skill;
                if (!player.additionalSkills.huashen || !player.additionalSkills.huashen.includes(skill)) {
                    player.flashAvatar("huashen", character);
                    player.syncStorage("huashen");
                    player.updateMarks("huashen");
                    await player.addAdditionalSkills("huashen", skill);
                    // lib.skill.rehuashen.createAudio(character,skill,'zuoci');
                }
            },
        },
        dcqixin: {
            mark: undefined,
            init(player, skill) {
                if (_status.gameStarted && !player.storage.dcqixin_hp) {
                    player.storage.dcqixin_hp = [player.maxHp, player.maxHp];
                }
                const mark = player.marks[skill];
                if (!mark) player.markSkill(skill);
                game.broadcastAll((player, skill) => {
                    lib.skill.dcqixin.$zhuanhuanji(skill, player);
                }, player, skill);
            },
            $zhuanhuanji(skill, player) {
                const character = Boolean(player.storage[skill]) ? "caojie" : "liuxie";
                const mark = player.marks[skill];
                if (mark) {
                    mark.setBackground(character, 'character');
                    mark._name = character;
                    mark.style.setProperty('background-size', 'cover', 'important');
                    mark.text.style.setProperty('font-size', '0px', 'important');
                }
                player.changeSkin({ characterName: "liuxiecaojie" }, "liuxiecaojie" + (player.storage[skill] ? "_shadow" : ""));
            },
        },
        olyicheng: {
            async content(event, trigger, player) {
                let num = player.maxHp, cards = get.cards(num, true);
                await player.showCards(cards, get.translation(player) + "发动了【易城】");
                if (player.countCards("h")) {
                    const sum = cards.reduce((num, card) => num + get.number(card), 0);
                    const { result: { bool, moved } } = await player.chooseToMove("易城：请选择你要交换的牌").set("filterMove", (from, to) => {
                        return typeof to !== "number";
                    }).set("list", [
                        ["牌堆顶", cards, list => {
                            const sum2 = list.reduce((num, card) => num + get.number(card, false), 0);
                            return "牌堆顶（现" + sum2 + { 0: "=", "-1": "<", 1: ">" }[get.sgn(sum2 - sum).toString()] + "原" + sum + "）";
                        }],
                        ["手牌", player.getCards("h")],
                    ]).set("filterOk", moved => moved[1].some(i => !get.owner(i))).set("processAI", list => {
                        const player = get.event("player"),
                            limit = Math.min(get.event("num"), player.countCards("h"));
                        let cards = list[0][1].slice(),
                            hs = player.getCards("h");
                        if (cards.reduce((num, card) => num + get.value(card), 0) > player.getCards("h").reduce((num, card) => num + get.value(card), 0)) {
                            cards.sort((a, b) => get.number(a) - get.number(b));
                            hs.sort((a, b) => get.number(b) - get.number(a));
                            let cards2 = cards.slice(0, limit),
                                hs2 = hs.slice(0, limit);
                            if (hs2.reduce((num, card) => num + get.number(card), 0) > cards2.reduce((num, card) => num + get.number(card), 0)) {
                                cards.removeArray(cards2);
                                hs.removeArray(hs2);
                                return [cards.concat(hs2), hs.concat(cards2)];
                            }
                            return [cards, hs];
                        } else {
                            cards.sort((a, b) => get.value(b) - get.value(a));
                            hs.sort((a, b) => get.value(a) - get.value(b));
                            let cards2 = cards.slice(0, limit),
                                hs2 = hs.slice(0, limit),
                                list = [cards, hs];
                            for (let i = 0; i < limit; i++) {
                                if (get.value(cards2[i]) > get.value(hs2[i])) {
                                    const change = [cards2[i], hs2[i]];
                                    cards[i] = change[1];
                                    hs[i] = change[0];
                                } else break;
                            }
                            return list;
                        }
                    }).set("num", num);
                    if (bool) {
                        const puts = player.getCards("h", i => moved[0].includes(i));
                        const gains = cards.filter(i => moved[1].includes(i));
                        if (puts.length && gains.length) {
                            player.$throw(puts, 1000);
                            await player.lose(puts, ui.special);
                            await player.gain(gains, "gain2");
                            //调整手牌顺序
                            let hs = moved[1].reverse();
                            hs.forEach((i, j) => {
                                player.node.handcards1.insertBefore(hs[j], player.node.handcards1.firstChild);
                            });
                            dui.queueNextFrameTick(dui.layoutHand, dui);

                            cards = moved[0].slice();
                            if (cards.length) {
                                await game.cardsGotoOrdering(cards);
                                for (let i = cards.length - 1; i >= 0; i--) {
                                    ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
                                }
                                game.log(cards, "被放回了牌堆顶");
                                game.updateRoundNumber();
                            }
                            await player.showCards(cards, get.translation(player) + "【易城】第一次交换后");
                            if (cards.reduce((num, card) => num + get.number(card), 0) > sum && player.countCards("h")) {
                                const { result: { bool } } = await player.chooseBool("易城：是否使用全部手牌交换" + get.translation(cards) + "？").set("choice", (() => {
                                    return cards.reduce((num, card) => num + get.value(card), 0) > player.getCards("h").reduce((num, card) => num + get.value(card), 0);
                                })());
                                if (bool) {
                                    const hs = player.getCards("h");
                                    player.$throw(hs, 1000);
                                    await player.lose(hs, ui.special);
                                    await player.gain(cards, "gain2");
                                    cards = hs.slice();
                                    if (cards.length) {
                                        await game.cardsGotoOrdering(cards);
                                        for (let i = cards.length - 1; i >= 0; i--) {
                                            ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
                                        }
                                        game.log(cards, "被放回了牌堆顶");
                                        game.updateRoundNumber();
                                    }
                                    await player.showCards(cards, get.translation(player) + "【易城】第二次交换后");
                                }
                            }
                        }
                    }
                }
            },
        },
        nk_shekong: {
            content: function () {
                'step 0';
                event.cardsx = cards.slice(0);
                var num = get.cnNumber(cards.length);
                var trans = get.translation(player);
                var prompt = ('弃置' + num + '张牌，然后' + trans + '摸一张牌');
                if (cards.length > 1) prompt += ('；或弃置一张牌，然后' + trans + '摸' + num + '张牌');
                var next = target.chooseToDiscard(prompt, 'he', true);
                next.numx = cards.length;
                next.selectCard = function () {
                    if (ui.selected.cards.length > 1) return _status.event.numx;
                    return [1, _status.event.numx];
                };
                next.complexCard = true;
                next.ai = function (card) {
                    if (ui.selected.cards.length == 0 || (_status.event.player.countCards('he',
                        function (cardxq) {
                            return get.value(cardxq) < 7;
                        }) >= _status.event.numx)) return 7 - get.value(card);
                    return -1;
                };
                'step 1';
                if (result.bool) {
                    if (result.cards.length == cards.length) player.draw();
                    else player.draw(cards.length);
                    event.cardsx.addArray(result.cards);
                    for (var i = 0; i < event.cardsx.length; i++) {
                        if (get.position(event.cardsx[i]) != 'd') event.cardsx.splice(i--, 1);
                    }
                } else event.finish();
                'step 2';
                if (event.cardsx.length) {
                    var cards = event.cardsx;
                    var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                    dialog.caption = '【设控】';
                    game.broadcast(function (player, cards, callback) {
                        if (!window.decadeUI) return;
                        var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
                        dialog.caption = '【设控】';
                        dialog.callback = callback;
                    }, player, cards, dialog.callback);

                    event.switchToAuto = function () {
                        var cards = dialog.cards[0].concat();
                        var cheats = [];
                        var judges;

                        var next = player.getNext();
                        var friend = (get.attitude(player, next) < 0) ? null : next;
                        judges = next.node.judges.childNodes;

                        if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);

                        if (friend) {
                            cards = decadeUI.get.bestValueCards(cards, friend);
                        } else {
                            cards.sort(function (a, b) {
                                return get.value(a, next) - get.value(b, next);
                            });
                        }

                        cards = cheats.concat(cards);
                        var time = 500;
                        for (var i = 0; i < cards.length; i++) {
                            setTimeout(function (card, index, finished) {
                                dialog.move(card, index, 0);
                                if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);
                                ;
                            }, time, cards[i], i, i >= cards.length - 1);
                            time += 500;
                        }
                    };

                    if (event.isOnline()) {
                        event.player.send(function () {
                            if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                        }, event.player);

                        event.player.wait();
                        decadeUI.game.wait();
                    } else if (!event.isMine()) {
                        event.switchToAuto();
                    }
                } else event.finish();
            }
        },
        kamome_huanmeng: {
            content: function () {
                "step 0";
                if (player.isUnderControl()) {
                    game.modeSwapPlayer(player);
                }
                var num = 1 + player.countCards('e');
                ;
                var cards = get.cards(num);
                var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                guanxing.caption = '【幻梦】';
                game.broadcast(function (player, cards, callback) {
                    if (!window.decadeUI) return;
                    var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
                    guanxing.caption = '【幻梦】';
                    guanxing.callback = callback;
                }, player, cards, guanxing.callback);

                event.switchToAuto = function () {
                    var cards = guanxing.cards[0].concat();
                    var cheats = [];
                    var judges = player.node.judges.childNodes;

                    if (judges.length) cheats = decadeUI.get.cheatJudgeCards(cards, judges, true);
                    if (cards.length) {
                        for (var i = 0; i >= 0 && i < cards.length; i++) {
                            if (get.value(cards[i], player) >= 5) {
                                cheats.push(cards[i]);
                                cards.splice(i, 1);
                            }
                        }
                    }

                    var time = 500;
                    for (var i = 0; i < cheats.length; i++) {
                        setTimeout(function (card, index, finished) {
                            guanxing.move(card, index, 0);
                            if (finished) guanxing.finishTime(1000);
                        }, time, cheats[i], i, (i >= cheats.length - 1) && cards.length == 0);
                        time += 500;
                    }

                    for (var i = 0; i < cards.length; i++) {
                        setTimeout(function (card, index, finished) {
                            guanxing.move(card, index, 1);
                            if (finished) guanxing.finishTime(1000);
                        }, time, cards[i], i, (i >= cards.length - 1));
                        time += 500;
                    }
                };

                if (event.isOnline()) {
                    event.player.send(function () {
                        if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
                    }, event.player);

                    event.player.wait();
                    decadeUI.game.wait();
                } else if (!event.isMine()) {
                    event.switchToAuto();
                }
                "step 1";
                player.popup(get.cnNumber(event.num1) + '上' + get.cnNumber(event.num2) + '下');
                game.log(player, '将' + get.cnNumber(event.num1) + '张牌置于牌堆顶，' + get.cnNumber(event.num2) + '张牌置于牌堆底');
                game.updateRoundNumber();
            }
        },
        guhuo_guess: {
            audio: 2,
            trigger: {
                player: ['useCardBefore', 'respondBefore'],
            },
            forced: true,
            silent: true,
            popup: false,
            firstDo: true,
            filter: function (event, player) {
                return event.skill && (event.skill.indexOf('guhuo_') == 0 || event.skill.indexOf('xinfu_guhuo_') == 0);
            },
            content: function () {
                'step 0'
                player.addTempSkill('guhuo_phase');
                event.fake = false;
                event.betrayer = null;
                var card = trigger.cards[0];
                if (card.name != trigger.card.name || (card.name == 'sha' && (trigger.card.nature || card.nature) && trigger.card.nature != card.nature)) event.fake = true;
                player.popup(trigger.card.name, 'metal');
                player.lose(card, ui.ordering).relatedEvent = trigger;
                trigger.throw = false;
                trigger.skill = 'xinfu_guhuo_backup';
                event.prompt = get.translation(player) + '声明' + (trigger.targets && trigger.targets.length ? '对' + get.translation(trigger.targets) : '') +
                    '使用' + (get.translation(trigger.card.nature) || '') + get.translation(trigger.card.name) + '，是否质疑？';
                event.targets = game.filterPlayer(function (current) {
                    return current != player && !current.hasSkill('chanyuan');
                }).sortBySeat(_status.currentPhase);
                if (!event.targets.length) event.goto(4);
                'step 1'
                event.target = event.targets.shift();
                event.target.chooseButton([event.prompt, [['reguhuo_ally', 'reguhuo_betray'], 'vcard']], true).set('ai', function (button) {
                    var player = _status.event.player;
                    var evt = _status.event.getParent('guhuo_guess'), evtx = evt.getTrigger();
                    if (!evt) return Math.random();
                    var card = { name: evtx.card.name, nature: evtx.card.nature, isCard: true };
                    var ally = button.link[2] == 'reguhuo_ally';
                    if (ally && (player.hp <= 1 || get.attitude(player, evt.player) >= 0)) return 1.1;
                    if (!ally && get.attitude(player, evt.player) < 0 && evtx.name == 'useCard') {
                        var eff = 0;
                        var targetsx = evtx.targets || [];
                        for (var target of targetsx) {
                            var isMe = target == evt.player;
                            eff += get.effect(target, card, evt.player, player) / (isMe ? 1.5 : 1);
                        }
                        eff /= (1.5 * targetsx.length) || 1;
                        if (eff > 0) return 0;
                        if (eff < -7) return Math.random() + Math.pow(-(eff + 7) / 8, 2);
                        return Math.pow((get.value(card, evt.player, 'raw') - 4) / (eff == 0 ? 5 : 10), 2);
                    }
                    return Math.random();
                });
                'step 2'
                if (result.links[0][2] == 'reguhuo_betray') {
                    target.addExpose(0.2);
                    game.log(target, '#y质疑');
                    target.popup('质疑！', 'fire');
                    event.betrayer = target;
                }
                else {
                    game.log(target, '#g不质疑');
                    target.popup('不质疑', 'wood');
                }
                'step 3'
                game.delay();
                if (!event.betrayer && targets.length) event.goto(1);
                'step 4'
                player.showCards(trigger.cards);
                if (!event.betrayer) event.finish();
                'step 5'
                if (event.fake) {
                    event.betrayer.popup('质疑正确', 'wood');
                    game.log(player, '声明的', trigger.card, '作废了');
                    trigger.cancel();
                    trigger.getParent().goto(0);
                    trigger.line = false;
                }
                else {
                    event.betrayer.popup('质疑错误', 'fire');
                    event.betrayer.addSkillLog('chanyuan');
                }
                'step 6'
                game.delayx();
            },
        },

        old_guhuo_guess: {
            audio: 'old_guhuo',
            trigger: {
                player: ['useCardBefore', 'respondBefore'],
            },
            forced: true,
            silent: true,
            popup: false,
            firstDo: true,
            filter: function (event, player) {
                return event.skill && event.skill.indexOf('old_guhuo_') == 0;
            },
            content: function () {
                'step 0'
                event.fake = false;
                event.goon = true;
                event.betrayers = [];
                var card = trigger.cards[0];
                if (card.name != trigger.card.name || (card.name == 'sha' && (trigger.card.nature || card.nature) && trigger.card.nature != card.nature)) event.fake = true;
                if (event.fake) {
                    player.addSkill('old_guhuo_cheated');
                    player.markAuto('old_guhuo_cheated', [trigger.card.name + trigger.card.nature]);
                }
                player.popup(trigger.card.name, 'metal');
                player.lose(card, ui.ordering).relatedEvent = trigger;
                trigger.throw = false;
                trigger.skill = 'old_guhuo_backup';
                game.log(player, '声明', trigger.targets && trigger.targets.length ? '对' : '', trigger.targets, '使用', trigger.card);
                event.prompt = get.translation(player) + '声明' + (trigger.targets && trigger.targets.length ? '对' + get.translation(trigger.targets) : '') +
                    '使用' + (get.translation(trigger.card.nature) || '') + get.translation(trigger.card.name) + '，是否质疑？';
                event.targets = game.filterPlayer(i => i != player && i.hp > 0).sortBySeat(_status.currentPhase);
                if (!event.targets.length) event.goto(4);
                'step 1'
                event.target = event.targets.shift();
                event.target.chooseButton([event.prompt, [['reguhuo_ally', 'reguhuo_betray'], 'vcard']], true).set('ai', function (button) {
                    var player = _status.event.player;
                    var evt = _status.event.getParent('old_guhuo_guess'), evtx = evt.getTrigger();
                    if (!evt) return Math.random();
                    var card = { name: evtx.card.name, nature: evtx.card.nature, isCard: true };
                    var ally = button.link[2] == 'reguhuo_ally';
                    if (ally && (player.hp <= 1 || get.attitude(player, evt.player) >= 0)) return 1.1;
                    if (!ally && get.effect(player, { name: 'losehp' }, player, player) >= 0) return 10;
                    if (!ally && get.attitude(player, evt.player) < 0) {
                        if (evtx.name == 'useCard') {
                            var eff = 0;
                            var targetsx = evtx.targets || [];
                            for (var target of targetsx) {
                                var isMe = target == evt.player;
                                eff += get.effect(target, card, evt.player, player) / (isMe ? 1.35 : 1);
                            }
                            eff /= (1.5 * targetsx.length) || 1;
                            if (eff > 0) return 0;
                            if (eff < -7) return (Math.random() + Math.pow(-(eff + 7) / 8, 2)) / Math.sqrt(evt.betrayers.length + 1) + (player.hp - 3) * 0.05 + Math.max(0, 4 - evt.player.hp) * 0.05 - (player.hp == 1 && !get.tag(card, 'damage') ? 0.2 : 0);
                            return Math.pow((get.value(card, evt.player, 'raw') - 4) / (eff == 0 ? 3.1 : 10), 2) / Math.sqrt(evt.betrayers.length || 1) + (player.hp - 3) * 0.05 + Math.max(0, 4 - evt.player.hp) * 0.05;
                        }
                        if (evt.player.getStorage('old_guhuo_cheated').contains(card.name + card.nature)) return Math.random() + 0.3;
                    }
                    return Math.random();
                });
                'step 2'
                if (result.links[0][2] == 'reguhuo_betray') {
                    target.addExpose(0.2);
                    game.log(target, '#y质疑');
                    target.popup('质疑！', 'fire');
                    event.betrayers.push(target);
                }
                else {
                    game.log(target, '#g不质疑');
                    target.popup('不质疑', 'wood');
                }
                'step 3'
                game.delay();
                if (targets.length) event.goto(1);
                'step 4'
                player.showCards(trigger.cards);
                if (!event.betrayers.length) event.finish();
                'step 5'
                if (event.fake) {
                    for (var target of event.betrayers) {
                        target.popup('质疑正确', 'wood');
                    }
                    game.asyncDraw(event.betrayers);
                    event.goon = false;
                }
                else {
                    for (var target of event.betrayers) {
                        target.popup('质疑错误', 'fire');
                        target.loseHp();
                    }
                    if (get.suit(trigger.cards[0], player) != 'heart') {
                        event.goon = false;
                    }
                }
                'step 6'
                if (!event.goon) {
                    game.log(player, '声明的', trigger.card, '作废了');
                    trigger.cancel();
                    trigger.getParent().goto(0);
                    trigger.line = false;
                }
                'step 7'
                game.delayx();
            },
        },
        //注意：twtanfeng非版本不可用而修改，而是为了适配视为使用XX牌的转化写的以viewAs方法实现效果的技能的“示例”
        //玩家可以以此chooseToUse为模板，对自己想要实现的“将XX牌当作XX牌使用”的技能写成支持viewAs的模板以实现萌修十周年对viewAs卡牌选中美化的支持
        twtanfeng: {
            content: function () {
                'step 0'
                player.chooseTarget(get.prompt2('twtanfeng'), function (card, player, target) {
                    return target != player && target.countDiscardableCards(player, 'hej') > 0;
                }).set('ai', function (target) {
                    var player = _status.event.player, num = 1;
                    if (get.attitude(player, target) > 0) num = 3;
                    else if (!target.countCards('he') || !target.canUse('sha', player)) {
                        if (target.hp + target.countCards('hs', { name: ['tao', 'jiu'] }) <= 1) num = 2;
                        else num = 1.2;
                    }
                    return get.effect(target, { name: 'guohe' }, player, player) * num * ((player.hp <= 1 && get.attitude(player, target) <= 0) ? 0 : 1);
                }).setHiddenSkill('twtanfeng');
                'step 1'
                if (result.bool) {
                    var target = result.targets[0];
                    event.target = target;
                    player.logSkill('twtanfeng', target);
                    player.discardPlayerCard(target, 'hej', true);
                }
                else event.finish();
                'step 2'
                var next = target.chooseToUse();
                next.set('openskilldialog', '###探锋：选择一张牌当作【杀】对' + get.translation(player) + '使用###或点击“取消”，受到其造成的1点火焰伤害，并令其跳过本回合的一个阶段（准备阶段和结束阶段除外）');
                next.set('norestore', true);
                next.set('_backupevent', 'twtanfeng_backup');
                next.set('custom', {
                    add: {},
                    replace: { window: function () { } }
                });
                next.backup('twtanfeng_backup');
                next.set('targetRequired', true);
                next.set('complexSelect', true);
                next.set('filterTarget', function (card, player, target) {
                    if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
                    return lib.filter.targetEnabled.apply(this, arguments);
                });
                next.set('sourcex', player);
                next.set('addCount', false);
                'step 3'
                if (!result.bool) {
                    player.line(target, 'fire');
                    target.damage(1, 'fire');
                }
                else event.finish();
                'step 4'
                if (!target.isIn()) { event.finish(); return; }
                var list = [], list2 = [];
                event.map = { phaseJudge: '判定阶段', phaseDraw: '摸牌阶段', phaseUse: '出牌阶段', phaseDiscard: '弃牌阶段' };
                for (var i of ['phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard']) {
                    if (!player.skipList.includes(i)) {
                        i = event.map[i];
                        list.push(i);
                        if (i != '判定阶段' && i != '弃牌阶段') list2.push(i);
                    }
                }
                target.chooseControl(list).set('prompt', '探锋：令' + get.translation(player) + '跳过一个阶段').set('ai', function () {
                    return _status.event.choice;
                }).set('choice', function () {
                    var att = get.attitude(target, player);
                    var num = player.countCards('j');
                    if (att > 0) {
                        if (list.includes('判定阶段') && num > 0) return '判定阶段';
                        return '弃牌阶段';
                    }
                    if (list.includes('摸牌阶段') && player.hasJudge('lebu')) return '摸牌阶段';
                    if (list.includes('出牌阶段') && player.hasJudge('bingliang') || player.needsToDiscard() > 0) return '出牌阶段';
                    return list2.randomGet();
                }());
                'step 5'
                for (var i in event.map) {
                    if (event.map[i] == result.control) player.skip(i);
                }
                target.popup(result.control);
                target.line(player);
                game.log(player, '跳过了', '#y' + result.control);
            },
            subSkill: {
                backup: {
                    viewAs: { name: 'sha' },
                    filterCard: true,
                    position: 'hes',
                    check: function (card) {
                        var player = _status.event.player, target = _status.event.getParent().player;
                        var eff = get.effect(target, get.autoViewAs({ name: 'sha' }, [card]), player, player);
                        var eff2 = get.damageEffect(player, target, player, 'fire');
                        if (eff < 0 || eff2 > 0 || eff2 > eff || get.tag(card, 'recover')) return 0;
                        return (player.hp == 1 ? 10 : 6) - get.value(card);
                    },
                },
            },
        },
    };

    decadeUI.inheritSubSkill = {
        olziruo: {
            sort: {
                async content(event, trigger, player) {
                    event.getParent(2).goto(0);
                    if (_status.connectMode || !event.isMine()) {
                        player.tempBanSkill("olziruo_sort", { player: ["useCard1", "useSkillBegin", "chooseToUseEnd"] });
                    }
                    const next = player.chooseToMove("自若：请整理手牌顺序", true);
                    next.set("list", [["手牌", player.getCards("h")]]);
                    next.set("processAI", list => {
                        let player = get.player(), cards = list[0][1].slice(0);
                        cards.sort((a, b) => get.useful(b, player) - get.useful(a, player));
                        if (player.storage.olziruo) cards.reverse();
                        return [cards];
                    });
                    const result = await next.forResult();
                    if (!result || !result.bool) return;
                    let hs = result.moved[0].reverse();
                    hs.forEach((i, j) => {
                        player.node.handcards1.insertBefore(hs[j], player.node.handcards1.firstChild);
                    });
                    dui.queueNextFrameTick(dui.layoutHand, dui);
                },
            },
        },
    };

    if (!_status.connectMode) {
        for (var key in decadeUI.animateSkill) {
            lib.skill[key] = decadeUI.animateSkill[key];
            game.addGlobalSkill(key);
        }
        for (var key in decadeUI.skill) {
            /*if (lib.skill[key]) */lib.skill[key] = decadeUI.skill[key];
        }
        for (var key in decadeUI.inheritSkill) {
            if (lib.skill[key]) {
                for (var j in decadeUI.inheritSkill[key]) {
                    lib.skill[key][j] = decadeUI.inheritSkill[key][j];
                }
            }
        }
        for (const key in decadeUI.inheritSubSkill) {
            if (lib.skill[key]) {
                if (!lib.skill[key].subSkill) continue;
                for (const j in decadeUI.inheritSubSkill[key]) {
                    if (!lib.skill[key].subSkill[j]) continue;
                    for (const k in decadeUI.inheritSubSkill[key][j]) {
                        lib.skill[key].subSkill[j][k] = decadeUI.inheritSubSkill[key][j][k];
                    }
                }
            }
        }
    }
});

