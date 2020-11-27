import {set} from 'lodash';
import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);

    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);

    this.bgPrizes = document.querySelector('.bg__prizes');
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    this.onUrlHashChanged();
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay();
    }
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    this.changePageDisplay();
  }

  changePageDisplay() {
    this.changeVisibilityDisplay();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay() {
    const changeDisplay = () => {
      this.screenElements[this.activeScreen].classList.add(`active`);
      this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
      return;
    }

    this.screenElements.forEach((screen) => {
      // условие при котором мы проверяем, если клик произшел с экрана призы
      // нужно удалить бэкгруанд
      const bgPrizesItem = document.querySelector('.bg-section');
      if (screen.id === 'prizes' && !screen.classList.contains('screen--hidden')) {
        bgPrizesItem.classList.remove('bg-section_active');
      }
      // условие при котороым мы проверяем с какого экрана был произведен клик и на какой.
      // если с истории на призы, то выполнить переключение с задержкой
      if (screen.id === 'story' && !screen.classList.contains('screen--hidden') && this.screenElements[this.activeScreen].classList.contains('screen--prizes')) {
        bgPrizesItem.classList.add('bg-section_active')
        setTimeout(() => {
          screen.classList.add(`screen--hidden`);
          screen.classList.remove(`active`);
          changeDisplay();
        }, 800);
      } else  {
        screen.classList.add(`screen--hidden`);
        screen.classList.remove(`active`);
      }
    });

    changeDisplay();
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }
}
