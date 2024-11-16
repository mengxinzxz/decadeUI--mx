app.import(function (lib, game, ui, get, ai, _status, app) {
	var plugin = {
		name: "character",
		filter: function () {
			return !["chess", "tafang"].includes(get.mode());
		},
		content: function (next) {},
		precontent: function () {
			app.reWriteFunction(lib, {
				setIntro: [
					function (args, node) {
						if (get.itemtype(node) === "player") {
							if (lib.config.touchscreen) {
								lib.setLongPress(node, plugin.click.playerIntro);
							} else {
								if (lib.config.right_info) {
									node.oncontextmenu = plugin.click.playerIntro;
								}
							}
							return node;
						}
					},
				],
			});
		},

		click: {
			identity: function (e) {
				e.stopPropagation();
				var player = this.parentNode;
				if (!game.getIdentityList) return;
				if (player.node.guessDialog) {
					player.node.guessDialog.classList.toggle("hidden");
				} else {
					var list = game.getIdentityList(player);
					if (!list) return;
					var guessDialog = ui.create.div(".guessDialog", player);
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

				var container = ui.create.div(".popup-container.hidden", ui.window, function (e) {
					if (e.target === container) {
						container.hide();
						game.resume2();
					}
				});
				var dialog = ui.create.div(".character-dialog.popped", container);
				var leftPane = ui.create.div(".left", dialog);
				var rightPane = ui.create.div(".right", dialog);

				container.show = function (player) {
					//通过势力判断技能框的背景颜色
					var extensionPath = lib.assetURL + "extension/十周年UI/shoushaUI/";
					var group = player.group;
					if (group != "wei" && group != "shu" && group != "wu" && group != "qun" && group != "ye" && group != "jin" && group != "daqin" && group != "western" && group != "shen" && group != "key") group = "default";
					var url = extensionPath + "character/images/skt_" + group + ".png";
					dialog.style.backgroundImage = 'url("' + url + '")';
					var skin1 = ui.create.div(".skin1", dialog);
					var skin2 = ui.create.div(".skin2", dialog);

					//判断是否隐藏，以及获取主副将的姓名
					var name = player.name1 || player.name;
					var name2 = player.name2;
					if (player.classList.contains("unseen") && player !== game.me) {
						name = "unknown";
					}
					if (player.classList.contains("unseen2") && player !== game.me) {
						name2 = "unknown";
					}

					//主将立绘
					var playerSkin;
					if (name != "unknown") {
						playerSkin = player.style.backgroundImage;
						if (!playerSkin) playerSkin = player.childNodes[0].style.backgroundImage;
						skin1.style.backgroundImage = playerSkin;
					} else {
						var url = extensionPath + "character/images/unknown.png";
						skin1.style.backgroundImage = 'url("' + url + '")';
					}
					//副将立绘
					if (name2) {
						var playerSkin2;
						if (name2 != "unknown") {
							playerSkin2 = player.childNodes[1].style.backgroundImage;
							skin2.style.backgroundImage = playerSkin2;
						} else {
							var url = extensionPath + "character/images/unknown.png";
							skin2.style.backgroundImage = 'url("' + url + '")';
						}
					}

					//适配最新版千幻
					if (name) {
						var value = (() => {
							let value = "";
							let value2, value3;
							if (lib.config["extension_千幻聆音_enable"]) {
								value2 = game.qhly_getSkin(name);
								if (value2) value2 = value2.substring(0, value2.lastIndexOf("."));
								else value2 = "经典形象";
							} else value2 = "经典形象";
							value += value2 + "*" + get.translation(name);
							if (name2) {
								value += "<br>";
								if (lib.config["extension_千幻聆音_enable"]) {
									value3 = game.qhly_getSkin(name2);
									if (value) value3 = value3.substring(0, value3.lastIndexOf("."));
									else value3 = "经典形象";
								} else value3 = "经典形象";
								value += value3 + "*" + get.translation(name2);
							}
							return value;
						})();
						var pe = ui.create.div(".pe1", dialog);
						var pn = ui.create.div(".pn1", value);
						pe.appendChild(pn);
					}

					//武将姓名
					var nametext = "";
					if (name) {
						if (name == "unknown") nametext += "未知";
						else if (lib.translate[name + "_ab"]) nametext += lib.translate[name + "_ab"];
						else nametext += get.translation(name);
						if (name2) {
							nametext += "/";
							if (name2 == "unknown") nametext += "未知";
							else if (lib.translate[name2 + "_ab"]) nametext += lib.translate[name2 + "_ab"];
							else nametext += get.translation(name2);
						}
					}
					var namestyle = ui.create.div(".name", nametext, dialog);
					namestyle.dataset.camp = group;
					if (name && name2) {
						namestyle.style.fontSize = "18px";
						namestyle.style.letterSpacing = "1px";
					}

					//分包
					const getName = (() => {
						const pack = Object.keys(lib.characterPack).find(pak => lib.characterPack[pak][name]);
						if (pack) {
							if (lib.characterSort[pack]) {
								const sort = Object.keys(lib.characterSort[pack]).find(i => lib.characterSort[pack][i].includes(name));
								if (sort) return get.translation(sort);
							}
							return get.translation(pack + "_character_config");
						}
					})();
					if (getName) {
						const getName2 = (() => {
							if (name2 && name2 !== name) {
								const pack = Object.keys(lib.characterPack).find(pak => lib.characterPack[pak][name2]);
								if (pack) {
									if (lib.characterSort[pack]) {
										const sort = Object.keys(lib.characterSort[pack]).find(i => lib.characterSort[pack][i].includes(name2));
										if (sort) return get.translation(sort);
									}
									return get.translation(pack + "_character_config");
								}
							}
						})();
						ui.create.div(".pack", getName + (getName2 && getName2 !== getName ? "<br>" + getName2 : ""), dialog);
					}
					leftPane.innerHTML = "<div></div>";
					rightPane.innerHTML = "<div></div>";
					lib.setScroll(rightPane.firstChild);
					var oSkills = player.getSkills(null, false, false).slice(0);
					oSkills = oSkills.filter(function (skill) {
						if (!lib.skill[skill] || skill == "jiu") return false;
						if (lib.skill[skill].nopop || lib.skill[skill].equipSkill) return false;
						return lib.translate[skill + "_info"] && lib.translate[skill + "_info"] != "";
					});
					if (player == game.me) oSkills = oSkills.concat(player.hiddenSkills);
					if (oSkills.length) {
						oSkills.forEach(function (name) {
							if (player.forbiddenSkills[name]) {
								if (player.forbiddenSkills[name].length) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + "【" + lib.translate[name] + "】" + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + "（与" + get.translation(player.forbiddenSkills[name]) + "冲突）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
								else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + "【" + lib.translate[name] + "】" + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + "（双将禁用）" + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							} else if (player.hiddenSkills.includes(name)) {
								if (lib.skill[name].preHidden && get.mode() == "guozhan") {
									var id = name + "_idx";
									id = ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + "【" + lib.translate[name] + "】" + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">预亮技能</div>' + "</div>", rightPane.firstChild);
									var underlinenode = id.querySelector(".underlinenode");
									if (_status.prehidden_skills.includes(name)) underlinenode.classList.remove("on");
									underlinenode.link = name;
									underlinenode.listen(ui.click.hiddenskill);
								} else ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + "【" + lib.translate[name] + "】" + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							} else if (!player.getSkills().includes(name) || player.awakenedSkills.includes(name)) ui.create.div(".xskill", "<div data-color>" + '<span style="opacity:0.5">' + "【" + lib.translate[name] + "】" + "</span>" + "</div>" + "<div>" + '<span style="opacity:0.5">' + get.skillInfoTranslation(name, player) + "</span>" + "</div>", rightPane.firstChild);
							else if (lib.skill[name].frequent || lib.skill[name].subfrequent) {
								var id = name + "_id";
								id = ui.create.div(".xskill", "<div data-color>" + "【" + lib.translate[name] + "】" + "</div>" + "<div>" + get.skillInfoTranslation(name, player) + '<br><div class="underlinenode on gray" style="position:relative;padding-left:0;padding-top:7px">自动发动</div>' + "</div>", rightPane.firstChild);
								var underlinenode = id.querySelector(".underlinenode");
								if (lib.skill[name].frequent) {
									if (lib.config.autoskilllist.includes(name)) {
										underlinenode.classList.remove("on");
									}
								}
								if (lib.skill[name].subfrequent) {
									for (var j = 0; j < lib.skill[name].subfrequent.length; j++) {
										if (lib.config.autoskilllist.includes(name + "_" + lib.skill[name].subfrequent[j])) {
											underlinenode.classList.remove("on");
										}
									}
								}
								if (lib.config.autoskilllist.includes(name)) underlinenode.classList.remove("on");
								underlinenode.link = name;
								underlinenode.listen(ui.click.autoskill2);
							} else if (lib.skill[name].clickable && player.isIn() && player.isUnderControl(true)) {
								var id = name + "_idy";
								id = ui.create.div(".xskill", "<div data-color>" + "【" + lib.translate[name] + "】" + "</div>" + "<div>" + get.skillInfoTranslation(name, player) + '<br><div class="menubutton skillbutton" style="position:relative;margin-top:5px">点击发动</div>' + "</div>", rightPane.firstChild);
								var intronode = id.querySelector(".skillbutton");
								if (!_status.gameStarted || (lib.skill[name].clickableFilter && !lib.skill[name].clickableFilter(player))) {
									intronode.classList.add("disabled");
									intronode.style.opacity = 0.5;
								} else {
									intronode.link = player;
									intronode.func = lib.skill[name].clickable;
									intronode.classList.add("pointerdiv");
									intronode.listen(ui.click.skillbutton);
								}
							} else ui.create.div(".xskill", "<div data-color>【" + lib.translate[name] + "】</div>" + "<div>" + get.skillInfoTranslation(name, player) + "</div>", rightPane.firstChild);
						});
					}
					var hSkills = player.getCards("h");
					if (player != game.me && !player.noclick && (player.isUnderControl() || (!game.observe && game.me && game.me.hasSkillTag("viewHandcard", null, player, true)))) {
						ui.create.div(".xcaption", "手牌区域", rightPane.firstChild);
						hSkills.forEach(function (item) {
							var button = ui.create.button(item, "card", rightPane.firstChild, true);
							button.style.zoom = 0.65;
							button.style.marginTop = 0;
						});
					}
					var eSkills = player.getVCards("e");
					if (eSkills.length) {
						ui.create.div(".xcaption", "装备区域", rightPane.firstChild);
						eSkills.forEach(function (card) {
							let str = [get.translation(card), get.translation(card.name + "_info")];
							const cards = card.cards;
							if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) str[0] += "（" + get.translation(card.cards) + "）";
							const special = card.cards?.find(item => item.name == card.name && lib.card[item.name]?.cardPrompt);
							if (special) str[1] = lib.card[special.name].cardPrompt(special);
							ui.create.div(".xskill", "<div data-color>" + str[0] + "</div><div>" + str[1] + "</div>", rightPane.firstChild);
						});
					}
					var judges = player.getVCards("j");
					if (judges.length) {
						ui.create.div(".xcaption", "判定区域", rightPane.firstChild);
						judges.forEach(function (card) {
							const cards = card.cards;
							let str = get.translation(card);
							if (cards?.length && (cards?.length !== 1 || cards[0].name !== card.name)) {
								if (!lib.card[card]?.blankCard || player.isUnderControl(true)) str += "（" + get.translation(cards) + "）";
							}
							ui.create.div(".xskill", "<div data-color>" + str + "</div><div>" + get.translation(card.name + "_info") + "</div>", rightPane.firstChild);
						});
					}
					container.classList.remove("hidden");
					game.pause2();
				};
				plugin.characterDialog = container;
				container.show(this);
			},
		},
	};
	return plugin;
});
