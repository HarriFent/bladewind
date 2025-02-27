/**
 ** helper functions for BladeWind UI components using vanilla JS
 ** September 2021 by @mkocansey <@mkocansey>
 **/
const current_modal = [];
let el_name;

var domEl = (element) => {
    return dom_el(element);
}
var dom_el = (element) => {
    return (document.querySelector(element) != null) ? document.querySelector(element) : false;
}

var domEls = (element) => {
    return dom_els(element);
}
var dom_els = (element) => {
    return (document.querySelectorAll(element).length > 0) ? document.querySelectorAll(element) : false;
}

var validateForm = (form) => {
    let has_error = 0;
    let BreakException = {};
    try {
        dom_els(`${form} .required`).forEach((el) => {
            changeCss(el, '!border-error-400', 'remove', true);
            if (el.value === '') {
                let el_name = el.getAttribute('name');
                let el_parent = el.getAttribute('data-parent');
                let error_message = el.getAttribute('data-error-message');
                let show_error_inline = el.getAttribute('data-error-inline');
                let error_heading = el.getAttribute('data-error-heading');

                (el_parent !== null) ?
                    changeCss(`.${el_parent} .clickable`, '!border-error-400') :
                    changeCss(el, '!border-error-400', 'add', true);
                el.focus();
                if (error_message) {
                    (show_error_inline) ? unhide(`.${el_name}-inline-error`) :
                        showNotification(error_heading, error_message, 'error');
                }

                let listenerObj = {
                    'el': el,
                    'el_parent': el_parent,
                    'show_error_inline': show_error_inline
                };

                el.addEventListener('keyup', clearErrors.bind(null, listenerObj), false);

                has_error++;
                throw BreakException;
            }
        });
    } catch (e) {
    }
    return has_error === 0;
}

var clearErrors = (obj) => {
    let el = obj.el;
    let el_parent = obj.el_parent;
    let el_name = obj.el_name;
    let show_error_inline = obj.show_error_inline;
    if (el.value !== '') {
        (el_parent !== null) ?
            dom_el(`.${el_parent} .clickable`).classList.remove('!border-error-400') :
            el.classList.remove('!border-error-400');
        (show_error_inline) ? hide(`.${el_name}-inline-error`) : '';
    } else {
        (el_parent !== null) ?
            dom_el(`.${el_parent} .clickable`).classList.add('!border-error-400') :
            el.classList.add('!border-error-400');
        (show_error_inline) ? unhide(`.${el_name}-inline-error`) : '';
    }
}

// usage:  onkeypress="return isNumberKey(event)"
var isNumberKey = (event, with_dots = 1) => {
    let accepted_keys = (with_dots === 1) ? /[\d\b\\.]/ : /\d\b/;
    if (!event.key.toString().match(accepted_keys) && event.keyCode !== 8 && event.keyCode !== 9) {
        event.preventDefault();
    }
}

var callUserFunction = (func) => {
    if (func !== '' && func !== undefined) eval(func);
};

var serialize = (form) => {
    let data = new FormData(dom_el(form));
    let obj = {};
    for (let [key, value] of data) {
        /**
         ** in some cases the form field name and api parameter differ, and you want to
         ** display a more meaningful error message from Laravels $errors.. set an attr
         ** data-serialize-as on the form field. that value will be used instead of [key]
         ** example: input name="contact_name" data-serialize-as="contact_person"
         ** Laravel will display contact name field is required but contact_person : value
         ** will be sent to the API
         **/
        let this_element = document.getElementsByName(key);
        let serialize_as = this_element[0].getAttribute('data-serialize-as');
        obj[serialize_as ?? key] = value;
    }
    return obj;
}

var stringContains = (str, keyword) => {
    if (typeof (str) !== 'string') return false;
    return (str.indexOf(keyword) !== -1);
}

var doNothing = () => {
}

var changeCssForDomArray = (elements, css, mode = 'add') => {
    if (dom_els(elements).length > 0) {
        dom_els(elements).forEach((el) => {
            changeCss(el, css, mode, true);
        });
    }
}

var changeCss = (element, css, mode = 'add', elementIsDomObject = false) => {
    // css can be comma separated
    // if elementIsDomObject don't run it through dom_el
    if ((!elementIsDomObject && dom_el(element) != null) || (elementIsDomObject && element != null)) {
        if (css.indexOf(',') !== -1 || css.indexOf(' ') !== -1) {
            css = css.replace(/\s+/g, '').split(',');
            for (let classname of css) {
                (mode === 'add') ?
                    ((elementIsDomObject) ? element.classList.add(classname.trim()) : dom_el(element).classList.add(classname.trim())) :
                    ((elementIsDomObject) ? element.classList.remove(classname.trim()) : dom_el(element).classList.remove(classname.trim()));
            }
        } else {
            if ((!elementIsDomObject && dom_el(element).classList !== undefined) || (elementIsDomObject && element.classList !== undefined)) {
                (mode === 'add') ?
                    ((elementIsDomObject) ? element.classList.add(css) : dom_el(element).classList.add(css)) :
                    ((elementIsDomObject) ? element.classList.remove(css) : dom_el(element).classList.remove(css));
            }
        }
    }
}

var showModal = (element) => {
    unhide(`.bw-${element}-modal`);
    document.body.classList.add('overflow-hidden');
    dom_el(`.bw-${element}-modal`).focus();
    let current_index = (current_modal.length === 0) ? 0 : current_modal.length + 1;
    animateCSS(`.bw-${element}`, 'zoomIn').then(() => {
        current_modal[current_index] = element;
    });
}

var hideModal = (element) => {
    animateCSS(`.bw-${element}`, 'zoomOut').then(() => {
        hide(`.bw-${element}-modal`);
        current_modal.pop();
        document.body.classList.remove('overflow-hidden');
        dom_el(`.bw-${element}-modal`).removeEventListener('keydown', trapFocusInModal);
    });
}

var showButtonSpinner = (element) => {
    unhide(`${element} .bw-spinner`);
}

var hideButtonSpinner = (element) => {
    hide(`${element} .bw-spinner`);
}

var showModalActionButtons = (element) => {
    unhide(`.bw-${element} .modal-footer`);
}

var hideModalActionButtons = (element) => {
    hide(`.bw-${element} .modal-footer`);
}

var hide = (element, elementIsDomObject = false) => {
    if ((!elementIsDomObject && dom_el(element) != null) || (elementIsDomObject && element != null)) {
        changeCss(element, 'hidden', 'add', elementIsDomObject);
    }
}

var unhide = (element, elementIsDomObject = false) => {
    if ((!elementIsDomObject && dom_el(element) != null) || (elementIsDomObject && element != null)) {
        changeCss(element, 'hidden', 'remove', elementIsDomObject);
    }
}

var animateCSS = (element, animation) =>
    new Promise((resolve, reject) => {
        const animationName = `animate__${animation}`;
        const node = document.querySelector(element);
        node.classList.remove('hidden');
        node.classList.add('animate__animated', animationName);
        document.documentElement.style.setProperty('--animate-duration', '.5s');

        function handleAnimationEnd(event) {
            node.classList.remove('animate__animated', animationName);
            event.stopPropagation();
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });

var addToStorage = (key, val, storageType = 'localStorage') => {
    if (window.localStorage || window.sessionStorage) {
        (storageType === 'localStorage') ?
            localStorage.setItem(key, val) : sessionStorage.setItem(key, val);
    }
}

var getFromStorage = (key, storageType = 'localStorage') => {
    if (window.localStorage || window.sessionStorage) {
        return (storageType === 'localStorage') ?
            localStorage.getItem(key) : sessionStorage.getItem(key);
    }
}

var removeFromStorage = (key, storageType = 'localStorage') => {
    if (window.localStorage || window.sessionStorage) {
        (storageType === 'localStorage') ?
            localStorage.removeItem(key) : sessionStorage.removeItem(key);
    }
}

var goToTab = (el, color, context) => {
    let context_ = context.replace(/-/g, '_');
    let tab_content = dom_el('.bw-tc-' + el);
    if (tab_content === null) {
        alert('no matching x-bladewind.tab-content div found for this tab');
        return false;
    }
    changeCssForDomArray(
        `.${context}-headings li.atab span`,
        `text-${color}-500,border-${color}-500,hover:text-${color}-500,hover:border-${color}-500`,
        'remove');
    changeCssForDomArray(
        `.${context}-headings li.atab span`,
        'text-gray-500,border-transparent,hover:text-gray-600,hover:border-gray-300');
    changeCss(
        `.atab-${el} span`,
        'text-gray-500,border-transparent,hover:text-gray-600,hover:border-gray-300', 'remove');
    changeCss(
        `.atab-${el} span`,
        `text-${color}-500,border-${color}-500,hover:text-${color}-500,hover:border-${color}-500`);

    dom_els(`.${context_}-tab-contents div.atab-content`).forEach((el) => {
        hide(el, true);
    });
    unhide(tab_content, true);
}

var positionPrefix = (el, mode = 'blur') => {
    let transparency = dom_el(`.dv-${el} .prefix`).getAttribute('data-transparency');
    let offset = (transparency === '1') ? -5 : 7;
    let prefix_width = ((dom_el(`.dv-${el} .prefix`).offsetWidth) + offset) * 1;
    let default_label_left_pos = '0.875rem';
    let input_field = dom_el(`input.${el}`);
    let label_field = dom_el(`.dv-${el} label`);

    if (mode === 'blur') {
        if (label_field) {
            label_field.style.left = (input_field.value === '') ? `${prefix_width}px` : default_label_left_pos;
        }
        dom_el(`input.${el}`).style.paddingLeft = `${prefix_width}px`;
        input_field.addEventListener('focus', (event) => {
            positionPrefix(el, event.type);
            // for backward compatibility where {once:true} is not supported
            input_field.removeEventListener('focus', positionPrefix);
        }, {once: true});
    } else if (mode === 'focus') {
        if (label_field) label_field.style.left = default_label_left_pos;
        input_field.addEventListener('blur', (event) => {
            positionPrefix(el, event.type);
            // for backward compatibility where {once:true} is not supported
            input_field.removeEventListener('blur', positionPrefix);
        }, {once: true});
    }
}

var positionSuffix = (el) => {
    let transparency = dom_el(`.dv-${el} .suffix`).getAttribute('data-transparency');
    let offset = (transparency === '1') ? -5 : 7;
    let suffix_width = ((dom_el(`.dv-${el} .suffix`).offsetWidth) + offset) * 1;
    dom_el(`input.${el}`).style.paddingRight = `${suffix_width}px`;
}

var togglePassword = (el, mode) => {
    let input_field = dom_el(`input.${el}`);
    if (mode === 'show') {
        input_field.setAttribute('type', 'text');
        unhide(`.dv-${el} .suffix svg.hide-pwd`);
        hide(`.dv-${el} .suffix svg.show-pwd`);
    } else {
        input_field.setAttribute('type', 'password')
        unhide(`.dv-${el} .suffix svg.show-pwd`);
        hide(`.dv-${el} .suffix svg.hide-pwd`);
    }
}

var filterTable = (keyword, table) => {
    domEls(`${table} tbody tr`).forEach((tr) => {
        (tr.innerText.toLowerCase().includes(keyword.toLowerCase())) ?
            unhide(tr, true) : hide(tr, true);
    });
}

var selectTag = (value, name) => {
    let input = domEl(`input[name="${name}"]`);
    let max_selection = input.getAttribute('data-max-selection');
    let tag = domEl(`.bw-${name}-${value}`);
    let css = tag.getAttribute('class');
    if (input.value.includes(value)) { // remove
        let keyword = `(,?)${value}`;
        input.value = input.value.replace(input.value.match(keyword)[0], '');
        changeCss(tag, css.match(/bg-[\w]+-500/)[0], 'remove', true);
        changeCss(tag, (css.match(/bg-[\w]+-500/)[0]).replace('500', '200'), 'add', true);
        changeCss(tag, css.match(/text-[\w]+-50/)[0], 'remove', true);
        changeCss(tag, (css.match(/text-[\w]+-50/)[0]).replace('50', '500'), 'add', true);
    } else { // add
        let total_selected = (input.value === '') ? 0 : input.value.split(',').length;
        if (total_selected < max_selection) {
            input.value += `,${value}`;
            changeCss(tag, css.match(/bg-[\w]+-200/)[0], 'remove', true);
            changeCss(tag, (css.match(/bg-[\w]+-200/)[0]).replace('200', '500'), 'add', true);
            changeCss(tag, css.match(/text-[\w]+-500/)[0], 'remove', true);
            changeCss(tag, (css.match(/text-[\w]+-500/)[0]).replace('500', '50'), 'add', true);
        } else {
            showNotification(input.getAttribute('data-error-heading'), input.getAttribute('data-error-message'), 'error');
        }
    }
    stripComma(input)
}

var stripComma = (el) => {
    if (el.value.startsWith(',')) {
        el.value = el.value.replace(/^,/, '');
    }
}

var highlightSelectedTags = (values, name) => {
    if (values !== '') {
        let values_array = values.split(',');
        for (let x = 0; x < values_array.length; x++) {
            selectTag(values_array[x].trim(), name);
        }
    }
}

var compareDates = (el1, el2, message, inline) => {
    let date1_el = dom_el(`.${el1}`);
    let date2_el = dom_el(`.${el2}`);

    setTimeout(() => {
        let start_date = new Date(date1_el.value).getTime();
        let end_date = new Date(date2_el.value).getTime();

        if (start_date !== '' && end_date !== '') {
            if (start_date > end_date) {
                changeCss(date2_el, '!border-error-400', 'add', true);
                (inline !== 1) ? showNotification('', message, 'error') : dom_el(`.error-${el1}${el2}`).innerHTML = message;
                return false;
            } else {
                changeCss(date2_el, '!border-error-400', 'remove', true);
                return true;
            }
        }
    }, 100);
}


var trapFocusInModal = (event) => {
    let modal_name = current_modal[(current_modal.length - 1)];
    if (modal_name !== undefined) {
        const focusableElements = dom_els(`.bw-${modal_name}-modal input:not([type='hidden']):not([class*='hidden']), .bw-${modal_name}-modal button:not([class*="hidden"]),  .bw-${modal_name}-modal a:not([class*="hidden"])`);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
}

var checkMinMax = (min, max, el) => {
    let field = dom_el(`.${el}`);
    let minimum = parseInt(min);
    let maximum = parseInt(max);
    let error_message = field.getAttribute('data-error-message');
    let show_error_inline = field.getAttribute('data-error-inline');
    let error_heading = field.getAttribute('data-error-heading');

    if (field.value !== '' && ((!isNaN(minimum) && field.value < minimum) || (!isNaN(maximum) && field.value > maximum))) {
        changeCss(field, '!border-error-400', 'add', true);
        if (error_message) {
            (show_error_inline) ? unhide(`.${el_name}-inline-error`) :
                showNotification(error_heading, error_message, 'error');
        }
    } else {
        if (error_message) hide(`.${el_name}-inline-error`);
        changeCss(field, '!border-error-400', 'remove', true);
    }
}