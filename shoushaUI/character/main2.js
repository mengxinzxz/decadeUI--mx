app.import(function (lib, game, ui, get, ai, _status, app) {
  var plugin = {
    name: 'character',
    filter: function () {
      return !['chess', 'tafang'].contains(get.mode());
    },
    content: function (next) {
    },
    precontent: function () {
      app.reWriteFunction(lib, {
        setIntro: [function (args, node) {
          if (get.itemtype(node) === 'player') {
            if (lib.config.touchscreen) {
              lib.setLongPress(node, plugin.click.playerIntro);
            } else {
              if (lib.config.right_info) {
                node.oncontextmenu = plugin.click.playerIntro;
              }
            }
            return node;
          }
        }],
      });


    },

    click: {
      identity: function (e) {
        e.stopPropagation();
        var player = this.parentNode;
        if (!game.getIdentityList) return;
        if (player.node.guessDialog) {
          player.node.guessDialog.classList.toggle('hidden');
        } else {
          var list = game.getIdentityList(player);
          if (!list) return;
          var guessDialog = ui.create.div('.guessDialog', player);
          var container = ui.create.div(guessDialog);

          lib.setScroll(guessDialog);
          player.node.guessDialog = guessDialog;
        }
      },
      playerIntro: function (e) {
        e.stopPropagation();

        if (plugin.playerDialog) {
          return plugin.playerDialog.show(this);
        }

        var container = ui.create.div('.popup-container.hidden', ui.window, function (e) {
          if (e.target === container) {
            container.hide();
            game.resume2();
          }
        });
        var dialog = ui.create.div('.character-dialog.popped', container);
        var leftPane = ui.create.div('.left', dialog);
        var rightPane = ui.create.div('.right', dialog);

        var createButton = function (name, parent) {
          if (!name) return;
          if (!lib.character[name]) return;
          var button = ui.create.button(name, 'character', parent, true);
        };

        container.show = function (player) {
          var name = player.name1 || player.name;
          var name2 = player.name2;
          if (player.classList.contains('unseen') && player !== game.me) {
            name = 'unknown';
          }
          if (player.classList.contains('unseen2') && player !== game.me) {
            name2 = 'unknown';
          }

          leftPane.innerHTML = '<div></div>';
          createButton(name, leftPane.firstChild);
          createButton(name2, leftPane.firstChild);
          if (name && name2) {
            dialog.classList.remove('single');
          } else {
            dialog.classList.add('single');
          }

          rightPane.innerHTML = '<div></div>';
          lib.setScroll(rightPane.firstChild);
          var hSkills = player.getCards('h');
          var eSkills = player.getCards('e');
          var oSkills = player.getSkills(null, false, false).slice(0);
          var judges = player.getCards('j');
          oSkills = oSkills.filter(function (skill) {
            if (!lib.skill[skill] || skill == 'jiu') return false;
            if (lib.skill[skill].nopop || lib.skill[skill].equipSkill) return false;
            return lib.translate[skill + '_info'] && lib.translate[skill + '_info'] != '';
          });
          if (player == game.me && player.hiddenSkills.length) oSkills.addArray(player.hiddenSkills);

          var allShown = (player.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag('viewHandcard', null, player, true)));
          var shownHs = player.getShownCards();
          if (shownHs.length) {
            ui.create.div('.xcaption', (player.getCards('h').some(card => !shownHs.contains(card)) ? '明置的手牌' : '手牌区域'), rightPane.firstChild);
            shownHs.forEach(function (item) {
              var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
              card.style.zoom = '0.6';
              rightPane.firstChild.appendChild(card);
            });
            if (allShown) {
              var hs = player.getCards('h');
              hs.removeArray(shownHs);
              if (hs.length) {
                ui.create.div('.xcaption', '其他手牌', rightPane.firstChild);
                hs.forEach(function (item) {
                  var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
                  card.style.zoom = '0.6';
                  rightPane.firstChild.appendChild(card);
                });
              }
            }
          }
          else if (allShown) {
            var hs = player.getCards('h');
            if (hs.length) {
              ui.create.div('.xcaption', '手牌区域', rightPane.firstChild);
              hs.forEach(function (item) {
                var card = game.createCard(get.name(item, false), get.suit(item, false), get.number(item, false), get.nature(item, false));
                card.style.zoom = '0.6';
                rightPane.firstChild.appendChild(card);
              });
            }
          }

          if (oSkills.length) {
            ui.create.div('.xcaption', '武将技能', rightPane.firstChild);
            oSkills.forEach(function (name) {
              if (player.forbiddenSkills[name]) {
                if (player.forbiddenSkills[name].length) ui.create.div('.xskill', '<div data-color>' + '<span style="opacity:0.5">' + '【' + lib.translate[name] + '】' + '</span>' + '</div>' + '<div>' + '<span style="opacity:0.5">' + '（与' + get.translation(player.forbiddenSkills[name]) + '冲突）' + get.skillInfoTranslation(name, player) + '</span>' + '</div>', rightPane.firstChild);
                else ui.create.div('.xskill', '<div data-color>' + '<span style="opacity:0.5">' + '【' + lib.translate[name] + '】' + '</span>' + '</div>' + '<div>' + '<span style="opacity:0.5">' + '（双将禁用）' + get.skillInfoTranslation(name, player) + '</span>' + '</div>', rightPane.firstChild);
              }
              else if (player.hiddenSkills.contains(name)) {
                if (lib.skill[name].preHidden && get.mode() == 'guozhan') {
                  var id = name + '_idx';
                  id = ui.create.div('.xskill', '<div data-color>' + '<span style="opacity:0.5">' + '【' + lib.translate[name] + '】' + '</span>' + '</div>' + '<div>' + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>' + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div>' + '</div>', rightPane.firstChild);
                  var underlinenode = id.querySelector('.underlinenode');
                  if (_status.prehidden_skills.contains(name)) underlinenode.classList.remove('on');
                  underlinenode.link = name;
                  underlinenode.listen(ui.click.hiddenskill);
                }
                else ui.create.div('.xskill', '<div data-color>' + '<span style="opacity:0.5">' + '【' + lib.translate[name] + '】' + '</span>' + '</div>' + '<div>' + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>' + '</div>', rightPane.firstChild);
              }
              else if (!player.getSkills().contains(name) || player.awakenedSkills.contains(name)) ui.create.div('.xskill', '<div data-color>' + '<span style="opacity:0.5">' + '【' + lib.translate[name] + '】' + '</span>' + '</div>' + '<div>' + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + '</span>' + '</div>', rightPane.firstChild);
              else if (lib.skill[name].frequent || lib.skill[name].subfrequent) {
                var id = name + '_id';
                id = ui.create.div('.xskill', '<div data-color>' + '【' + lib.translate[name] + '】' + '</div>' + '<div>' + get.skillInfoTranslation(name, player) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div>' + '</div>', rightPane.firstChild);
                var underlinenode = id.querySelector('.underlinenode');
                if (lib.skill[name].frequent) {
                  if (lib.config.autoskilllist.contains(name)) {
                    underlinenode.classList.remove('on');
                  }
                }
                if (lib.skill[name].subfrequent) {
                  for (var j = 0; j < lib.skill[name].subfrequent.length; j++) {
                    if (lib.config.autoskilllist.contains(name + '_' + lib.skill[name].subfrequent[j])) {
                      underlinenode.classList.remove('on');
                    }
                  }
                }
                if (lib.config.autoskilllist.contains(name)) underlinenode.classList.remove('on');
                underlinenode.link = name;
                underlinenode.listen(ui.click.autoskill2);
              }
              else if (lib.skill[name].clickable && player.isIn() && player.isUnderControl(true)) {
                var id = name + '_idy';
                id = ui.create.div('.xskill', '<div data-color>' + '【' + lib.translate[name] + '】' + '</div>' + '<div>' + get.skillInfoTranslation(name, player) + '<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div>' + '</div>', rightPane.firstChild);
                var intronode = id.querySelector('.skillbutton');
                if (!_status.gameStarted || (lib.skill[name].clickableFilter && !lib.skill[name].clickableFilter(player))) {
                  intronode.classList.add('disabled');
                  intronode.style.opacity = 0.5;
                }
                else {
                  intronode.link = player;
                  intronode.func = lib.skill[name].clickable;
                  intronode.classList.add('pointerdiv');
                  intronode.listen(ui.click.skillbutton);
                }
              }
              else ui.create.div('.xskill', '<div data-color>【' + lib.translate[name] + '】</div>' + '<div>' + get.skillInfoTranslation(name, player) + '</div>', rightPane.firstChild);
            });
          }

          if (eSkills.length) {
            ui.create.div('.xcaption', '装备区域', rightPane.firstChild);
            eSkills.forEach(function (item) {
              ui.create.div('.xskill', '<div data-color>' + get.translation(item) + '</div><div>' + get.translation(item.name + '_info') + '</div>', rightPane.firstChild);
            });
          }

          if (judges.length) {
            ui.create.div('.xcaption', '判定区域', rightPane.firstChild);
            judges.forEach(function (card) {
              if (card.viewAs && card.viewAs != card.name) {
                ui.create.div('.xskill', '<div data-color>' + get.translation(card.viewAs) + '（' + get.translation(card) + '）' + '</div><div>' + get.translation(card.viewAs + '_info') + '</div>', rightPane.firstChild);
              }
              else ui.create.div('.xskill', '<div data-color>' + get.translation(card) + '</div><div>' + get.translation(card.name + '_info') + '</div>', rightPane.firstChild);
            });
          }

          container.classList.remove('hidden');
          game.pause2();
        };
        plugin.characterDialog = container;
        container.show(this);
      },
    },

  };
  return plugin;
});
