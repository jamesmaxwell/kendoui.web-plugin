/*
* Kendo UI Web MutiComboBox plugin
* Copyright 2012 junwei.hu  james.maxwell.hu@gmail.com
*
* Support MutiSelect for ComboBox.
*/
(function ($) {
    var kendo = window.kendo,
	ui = kendo.ui,
	ComboBox = ui.ComboBox,
	ns = ".kendoMutiComboBox",
	SELECT = "select",
	STATE_SELECTED = "k-state-selected",
    STATE_FILTER = "filter",
    STATE_ACCEPT = "accept",
	ALLCHK_HEIGHT = 25,
	DEFAULT_HEIGHT = 200;

    var MutiComboBox = ComboBox.extend({
        init: function (element, options) {
            var that = this,
			selAll,
			allText = options.allText || that.options.allText;

            options.template = '<span style="white-space:nowrap"><label><input type="checkbox" key="${data' + (options.dataValueField ? "." : "") + options.dataValueField + '}"/>${data' + (options.dataTextField ? "." : "") + options.dataTextField + '}</label></span>';
            ComboBox.fn.init.call(that, element, options);

            selAll = $('<div class="k-reset"/>')
				.height(ALLCHK_HEIGHT)
				.css({ 'border-bottom': '1px solid #fff', 'padding-bottom': '1px', 'padding-left': '5px' })
				.append('<label><input type="checkbox" name="_cmbAll"/>' + allText + '</label>')
				.prependTo(that.list);
			
            selAll.find('input').on('click', function (e) {
                that.list.find('input').prop('checked', $(this).prop('checked'));
                that._select(that.list.find('li').get(0));
            });

            kendo.notify(that);
        },

        options: {
            name: 'MutiComboBox',
            enable: true,
            allText: 'all'
        },

        setValue: function (values) {
            var that = this, texts = [], sels = 0;

            if (typeof (values) === 'string')
                values = values.split(',');

            that.list.find('input[name!=_cmbAll]').each(function (i) {
                if ($.inArray($(this).attr('key'), values) != -1) {
                    $(this).prop('checked', true);
                    texts.push($(this).parent().text());
                    sels++;
                }
            });

            if (that.list.find('input[name!=_cmbAll]').size() == sels) {
                that.list.find('input[name=_cmbAll]').prop('checked', true);
            }

            that.input[0].value = texts.join(',');
			that._accessor(values.join(','), 0);
        },
		
		value: function(value) {
            var that = this,
                idx;

            if (value !== undefined) {
                if (value !== null) {
                    value = value.toString();
                }

                that.setValue(value);
            } else {
                return that._accessor();
            }
        },		
		
		open: function() {
            var that = this,
				ulHeight,
                serverFiltering = that.dataSource.options.serverFiltering;

            if (that.popup.visible()) {
                return;
            }

            if (!that.ul[0].firstChild || (that._state === STATE_ACCEPT && !serverFiltering)) {
                that._open = true;
                that._state = STATE_REBIND;
                that._filterSource();
            } else {
                that.popup.open();
                that._scroll(that._current);
				
				//reset height, origion is 100%
				if(that.list.height() >= 200){
					ulHeight = that.options.height ? that.options.height : DEFAULT_HEIGHT;
					that.ul.height(ulHeight - ALLCHK_HEIGHT);
				}
            }
        },

        _click: function (e) {
            if (!e.isDefaultPrevented()) {
                this._accept($(e.currentTarget));

                if (e.type === "touchend") {
                    e.preventDefault();
                }
            }
            e.stopPropagation();
        },

        _blur: function () {
            var that = this;

            that._change();
            //that.close(); //not close in MutiCombobox
        },

        _select: function (li) {
            var that = this,
                texts = [],
                values = [],
                datas = that._data(),
                idx = that._highlight(li);

            if ($.isFunction(li))
                return;

            that.selectedIndex = idx;

            if (idx !== -1) {
                if (that._state === STATE_FILTER) {
                    that._state = STATE_ACCEPT;
                }

                that._current.addClass(STATE_SELECTED);

                that.list.find('input[name!=_cmbAll]').each(function (i) {
                    if ($(this).prop('checked') === true) {
                        data = datas[i];
                        texts.push(that._text(data));
                        values.push(that._value(data));
                    }
                });

                that.list.find('input[name=_cmbAll]').prop('checked',
					that.list.find('input[name!=_cmbAll]').size() == that.list.find('input[name!=_cmbAll]:checked').size());

                that._prev = that._text(datas[idx]);
                that.input[0].value = texts.join(',');
                that._accessor(values.join(','), idx);
                that._placeholder();

                if (that._optionID) {
                    that._current.attr("aria-selected", true);
                }
            }
        }
    });

    ui.plugin(MutiComboBox);
})(jQuery);