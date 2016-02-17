'use strict';

var $ = require('jquery');
var React = require('react');
var ReactDOMServer = require('react-dom-server');

var selectivityOptions = {
    ajax: React.PropTypes.object,
    allowClear: React.PropTypes.bool,
    backspaceHighlightsBeforeDelete: React.PropTypes.bool,
    closeOnSelect: React.PropTypes.bool,
    createTokenItem: React.PropTypes.func,
    dropdown: React.PropTypes.func,
    dropdownCssClass: React.PropTypes.string,
    initSelection: React.PropTypes.func,
    inputType: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.string]),
    items: React.PropTypes.array,
    matcher: React.PropTypes.func,
    multiple: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    positionDropdown: React.PropTypes.func,
    query: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    removeOnly: React.PropTypes.bool,
    shouldOpenSubmenu: React.PropTypes.func,
    showDropdown: React.PropTypes.bool,
    showSearchInputInDropdown: React.PropTypes.bool,
    suppressMouseWheelSelector: React.PropTypes.bool,
    templates: React.PropTypes.object,
    tokenizer: React.PropTypes.func,
    tokenSeparators: React.PropTypes.array
};

var selectivityCallbacks = {
    onDropdownClose: React.PropTypes.func,
    onDropdownOpen: React.PropTypes.func,
    onDropdownOpening: React.PropTypes.func,
    onHighlight: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    onSelecting: React.PropTypes.func
};

var otherProps = {
    className: React.PropTypes.string,
    data: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.object]),
    defaultData: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.object]),
    defaultValue: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string]),
    onClick: React.PropTypes.func,
    style: React.PropTypes.object,
    value: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string])
};

function propsToOptions(props) {

    var options = {};
    $.each(props, function(key, value) {
        if (key in selectivityOptions) {
            if (key === 'templates') {
                $.each(value, function(name, template) {
                    if ($.type(template) === 'function') {
                        value[name] = function(options) {
                            var result = template(options);
                            if ($.type(result) === 'string') {
                                return result;
                            } else {
                                return ReactDOMServer.renderToStaticMarkup(result);
                            }
                        };
                    }
                });
            }

            options[key] = value;
        }
    });
    return options;
}

var Selectivity = React.createClass({

    propTypes: $.extend({}, selectivityOptions, selectivityCallbacks, otherProps),

    close: function() {

        return this._getContainer().selectivity('close');
    },

    componentDidMount: function() {

        var props = this.props;

        var initOptions = propsToOptions(props);
        var data = props.data || props.defaultData;
        if (data) {
            initOptions.data = data;
        } else {
            var value = props.value || props.defaultValue;
            if (value) {
                initOptions.value = value;
            }
        }

        var $container = this._getContainer();
        $container.selectivity(initOptions);

        if (props.onChange) {
            $container.on('change', props.onChange);
        } else if (props.data || props.value) {
            console.debug('Selectivity: You have specified a data or value property without an ' +
                          'onChange listener. Maybe you want to use defaultData or defaultValue ' +
                          'instead?');
        }

        if (props.onDropdownClose) {
            $container.on('selectivity-close', props.onDropdownClose);
        }
        if (props.onDropdownOpen) {
            $container.on('selectivity-open', props.onDropdownOpen);
        }
        if (props.onDropdownOpening) {
            $container.on('selectivity-opening', props.onDropdownOpening);
        }
        if (props.onHighlight) {
            $container.on('selectivity-highlight', props.onHighlight);
        }
        if (props.onSelect) {
            $container.on('selectivity-selected', props.onSelect);
        }
        if (props.onSelecting) {
            $container.on('selectivity-selecting', props.onSelecting);
        }
    },

    componentWillReceiveProps: function(nextProps) {

        var $container = this._getContainer();
        $container.selectivity('setOptions', propsToOptions(nextProps));
        if (nextProps.data !== this.props.data) {
            $container.selectivity('data', nextProps.data, { triggerChange: false })
                      .selectivity('rerenderSelection');
        }
        if (nextProps.value !== this.props.value) {
            $container.selectivity('value', nextProps.value, { triggerChange: false })
                      .selectivity('rerenderSelection');
        }
    },

    focus: function() {

        this._getContainer().selectivity('focus');
    },

    getData: function() {

        return this._getContainer().selectivity('data');
    },

    getValue: function() {

        return this._getContainer().selectivity('value');
    },

    open: function() {

        return this._getContainer().selectivity('open');
    },

    render: function() {

        return React.createElement('div', {
            className: this.props.className,
            onClick: this.props.onClick,
            ref: 'container',
            style: this.props.style
        });
    },

    _getContainer: function() {

        return $(this.refs.container);
    }

});

module.exports = Selectivity;
