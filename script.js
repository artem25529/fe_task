const ALL = 'all'
const FAVORITES = 'favorites'
const HIDDEN = 'hidden'
const COMPARISON = 'comparison'
const CART_ITEMS = 'cart'
const ICONS_SECTION_CLASS = 'icons'
const ACTIVE_FILTER_BTN = 'activeFilterButton'
const SHOW_HIDDEN_CHECKED = 'showHiddenChecked'
const RATING_BACKGROUND_ORANGE_CLASS = 'rating-background__orange'
const RATING_BACKGROUND_GRAY_CLASS = 'rating-background__gray'
const CATALOG_ITEM_CLASS = 'catalog__item'
const FILTER_BTN_ACTIVE_CLASS = 'filter__button_pressed'
const CATALOG_ITEM_HIDDEN_CLASS = 'catalog__item_hidden'
const CATALOG_ITEM_PARTIALLY_VISIBLE_CLASS = 'catalog__item_partially-visible'
const ICON_ACTIVE_CLASS = 'icons_active'
const DATA_NAME = 'name'

const catalogItems = document.querySelectorAll(`.${CATALOG_ITEM_CLASS}`)
const catalogItemsArr = Array.from(catalogItems)
const ratingList = document.querySelectorAll('.info__rating')
const filterButtons = document.querySelectorAll('.filter__button')
const filterButtonsArr = Array.from(document.querySelectorAll('.filter__button'))
const showHiddenCheckbox = document.querySelector('.filter__show-hidden')
const addToCartButtonList = document.querySelectorAll('.content__add-to-cart-btn')
const iconsList = document.querySelectorAll(`.${ICONS_SECTION_CLASS}`)
const filterSection = document.querySelector('.filter')
const noItems = document.querySelector('.no-items')

let showHiddenCheckboxChecked
let filterButton

(function init() {
    initShowHiddenCheckbox()
    initFilterButton()
    regIconsEventListener()
    displayRating()
    filterCatalogItems()
    regFilterButtonsClickListener()
    regShowHiddenClickListener()
    regMouseenterMouseleaveEventListener()
    regAddToCartBtnEventListener()
})()

function initShowHiddenCheckbox() {
    const showHiddenChackboxCheckedInitial = localStorage.getItem(SHOW_HIDDEN_CHECKED)

    showHiddenCheckbox.checked = showHiddenCheckboxChecked = 
        !showHiddenChackboxCheckedInitial || showHiddenChackboxCheckedInitial === 'true'
}

function initFilterButton() {
    const activeFilterBtnInitial = localStorage.getItem(ACTIVE_FILTER_BTN)
    let activeButtonElem

    if (!activeFilterBtnInitial) {
        activeButtonElem = filterButtons[0]
        localStorage.setItem(ACTIVE_FILTER_BTN, activeButtonElem.dataset[DATA_NAME])
    } else {
        activeButtonElem = filterButtonsArr.find(btn => btn.dataset[DATA_NAME] === activeFilterBtnInitial)  
    }

    activeButtonElem.classList.add(FILTER_BTN_ACTIVE_CLASS)
    filterButton = activeButtonElem.dataset[DATA_NAME]
}

function displayRating() {
    for (const rating of ratingList) {
        const value = rating.dataset.rating
    
        const background = rating.nextElementSibling
        const backgroundOrange = background.querySelector(`.${RATING_BACKGROUND_ORANGE_CLASS}`)
        const backgroundGray = background.querySelector(`.${RATING_BACKGROUND_GRAY_CLASS}`)
    
        const backgroundOrangeFlexBasis = value * 100 / 5
        const backgroundGrayFlexBasis = 100 - backgroundOrangeFlexBasis
    
        backgroundOrange.style.flexBasis = `${backgroundOrangeFlexBasis}%`
        backgroundGray.style.flexBasis = `${backgroundGrayFlexBasis}%`
    }
}

function regMouseenterMouseleaveEventListener() {
    for (const catalogItem of catalogItems) {
        const background = catalogItem.querySelector('.catalog__background')
        const filler = catalogItem.querySelector('.content__filler')
        const button = catalogItem.querySelector('.content__add-to-cart-btn')
    
        const buttonShowTimingFunction = getVariableValue('--add-to-cart-btn-show-timing-function')
        const buttonHideTimingFunction = getVariableValue('--add-to-cart-btn-hide-timing-function')
        const buttonShowDelay = getVariableValue('--add-to-cart-btn-show-delay')
        const buttonShowDuration = getVariableValue('--add-to-cart-btn-show-duration')
        const backgroundPadding = getVariableValue('--background-padding')
    
        function resetBackgroundTransition(show) {
            const duration = show ? 
                parseFloat(buttonShowDuration) * 1000 : 
                (parseFloat(buttonShowDuration) + parseFloat(buttonShowDelay)) * 1000
            
            setTimeout(function() {
                background.style.transition = ''
            }, duration)
        }
    
        catalogItem.addEventListener('mouseenter', function(e) {
            const fillerComputedStyle = getComputedStyle(filler)
            const fillerHeight = fillerComputedStyle.height
            const targetBackgroundPaddingBottom = `calc(${fillerHeight} + 2em)`
    
            background.style.transition = `padding-bottom ${buttonShowDuration} ${buttonShowTimingFunction}`
            background.style.paddingBottom = targetBackgroundPaddingBottom
    
            button.style.transitionTimingFunction = buttonShowTimingFunction
            button.style.transitionDelay = buttonShowDelay
            button.style.opacity = 1
    
            resetBackgroundTransition(true)
        })
    
        catalogItem.addEventListener('mouseleave', function(e) {
            button.style.transitionDelay = ''
            button.style.transitionTimingFunction = buttonHideTimingFunction
            button.style.opacity = 0
            
            background.style.transition = `padding-bottom ${buttonShowDuration} ${buttonHideTimingFunction}`
            background.style.transitionDelay = buttonShowDelay
            background.style.paddingBottom = backgroundPadding
    
            resetBackgroundTransition(false)
        })
    }
}

function regAddToCartBtnEventListener() {
    for (const addToCartBtn of addToCartButtonList) {
        addToCartBtn.addEventListener('click', addToCartBtnHandler)
    }
}

function addToCartBtnHandler(e) {
    const catalogItem = this.closest(`.${CATALOG_ITEM_CLASS}`)
    const cartItems = JSON.parse(localStorage.getItem(CART_ITEMS)) || []
    const targetItem = cartItems.find(item => item.itemId === catalogItem.id)

    if (targetItem) {
        targetItem.qty++
    } else {
        cartItems.push({
            itemId: catalogItem.id,
            qty: 1
        })
    }

    localStorage.setItem(CART_ITEMS, JSON.stringify(cartItems))
}

function filterCatalogItems() {
    hideNoItems()

    catalogItemsArr.forEach(catalogItem => {
        const targetIcon = findIconByName(catalogItem, filterButton)
        const targetIconActive = targetIcon ? isIconActive(targetIcon) : true

        if (targetIconActive) {
            showCatalogItem(catalogItem)
            showHideItem(catalogItem)
        } else {
            hideCatalogItem(catalogItem)
        }
    })

    noItemsHandler()
}

function regFilterButtonsClickListener() {
    for (const filterBtn of filterButtons) {
        const btnName = filterBtn.dataset[DATA_NAME]
    
        filterBtn.addEventListener('click', function(e) {
            filterButtonsArr.forEach(fb => fb.classList.remove(FILTER_BTN_ACTIVE_CLASS))
            filterBtn.classList.add(FILTER_BTN_ACTIVE_CLASS)
            localStorage.setItem(ACTIVE_FILTER_BTN, btnName)
            filterButton = btnName
    
            filterCatalogItems()
        })
    }    
}

function regShowHiddenClickListener() {
    showHiddenCheckbox.addEventListener('click', function() {
        localStorage.setItem(SHOW_HIDDEN_CHECKED, showHiddenCheckbox.checked)
        showHiddenCheckboxChecked = showHiddenCheckbox.checked
        catalogItemsArr.forEach(showHideItem)
    })
}

function showHideItem(catalogItem) {
    hideNoItems()

    const hiddenIcon = findIconByName(catalogItem, HIDDEN)
    const hiddenIconActive = isIconActive(hiddenIcon)

    const currentFilterIconActive = filterButton === ALL || isIconActive(findIconByName(catalogItem, filterButton))

    if (hiddenIconActive) {
        if (showHiddenCheckboxChecked && currentFilterIconActive) {
            showCatalogItem(catalogItem)
        } else {
            hideCatalogItem(catalogItem)
        }
    }

    noItemsHandler()
}

function regIconsEventListener() {
    for(const icons of iconsList) {
        const itemId = findItemIdByChild(icons)
        for (const icon of icons.children) {
            const iconName = icon.dataset[DATA_NAME]
    
            if (isItemAddedToIconList(iconName, itemId)) {
                icon.classList.add(ICON_ACTIVE_CLASS)
                if (isIconVisibilityIcon(iconName)) {
                    visibilityIconClickHandler.call(icon)
                }
            }
    
            icon.addEventListener('click', function(e) {
                hideNoItems()

                icon.classList.toggle(ICON_ACTIVE_CLASS)
    
                const itemList = getItemListFromString(iconName)
                if (!itemList.includes(itemId)) {
                    itemList.push(itemId)
                } else {
                    const itemIdx = itemList.findIndex(elem => elem === itemId)
                    itemList.splice(itemIdx, 1)
                }
    
                localStorage.setItem(iconName, itemList.join(' '))

                if (filterButton !== ALL) {
                    if (!getActiveIcons(itemId).includes(filterButton)) {
                        hideCatalogItem(document.getElementById(itemId))
                    }
                }
                
                noItemsHandler()
            })
    
            if (isIconVisibilityIcon(iconName)) {
                icon.addEventListener('click', visibilityIconClickHandler)
            }
        }
    }
}

function getQtyOfVisibleitems() {
    return catalogItemsArr
        .filter(catalogItem => !catalogItem.classList.contains(CATALOG_ITEM_HIDDEN_CLASS)).length
}

function findIconByName(catalogItem, iconName) {
    return catalogItem
        .querySelector(`.${ICONS_SECTION_CLASS} > [data-${DATA_NAME}='${iconName}']`)
}

function isIconActive(icon) {
    return icon.classList.contains(ICON_ACTIVE_CLASS)
}

function hideCatalogItem(catalogItem) {
    catalogItem.classList.add(CATALOG_ITEM_HIDDEN_CLASS)
}

function showCatalogItem(catalogItem) {
    catalogItem.classList.remove(CATALOG_ITEM_HIDDEN_CLASS)
}

function getItemListFromString(iconName) {
    const itemListString = localStorage.getItem(iconName)
    return itemListString ? itemListString.split(' ') : []
}

function isItemAddedToIconList(iconName, itemId) {
    return getItemListFromString(iconName).includes(itemId)
}

function isIconVisibilityIcon(iconName) {
    return iconName === HIDDEN
}

function findItemIdByChild(child) {
    return child.closest(`.${CATALOG_ITEM_CLASS}`).id
}

function getActiveIcons(itemId) {
    return Array.from(document.getElementById(itemId).querySelectorAll(`.${ICON_ACTIVE_CLASS}`))
        .map(icon => icon.dataset[DATA_NAME])
}

function visibilityIconClickHandler() {
    const catalogItem = this.closest(`.${CATALOG_ITEM_CLASS}`)
    catalogItem.classList.toggle(CATALOG_ITEM_PARTIALLY_VISIBLE_CLASS)
    showHideItem(catalogItem)
}

function getVariableValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName)
}

function hideNoItems() {
    noItems.style.display = 'none'
}

function noItemsHandler() {
    const itemsQty = getQtyOfVisibleitems()

    if (!itemsQty) {
        noItems.style.display = 'block'
    }
}
