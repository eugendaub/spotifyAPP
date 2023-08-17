import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {BehaviorSubject} from 'rxjs';

const STORAGE_TABS_KEY = 'selected-tabs';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  defaultTabs = [
    {
      path: 'tab1',
      name: 'Sushi',
      icon: 'restaurant',
      iconAlt: 'restaurant-outline',
      selected: true,
    },
    {
      path: 'tab2',
      name: 'Drink',
      icon: 'beer',
      iconAlt: 'beer-outline',
      selected: true,
    },
    {
      path: 'tab4',
      name: 'All orders',
      icon: 'cart',
      iconAlt: 'cart-outline',
      selected: true,
    },
  ];


  optionalTabs = [
    {
      path: 'tab3',
      name: 'Kitchen order',
      icon: 'fast-food',
      iconAlt: 'fast-food-outline',
      selected: false,
    },
  ];

  private tabsSubject = new BehaviorSubject(null);

 // private waitTimeSubject = new BehaviorSubject(null);




  constructor() {
    this.loadSettings();
  }

  async getAvailableTabs() {
    const selectedTabs = await this.getSelectedTabs();

    return [...this.defaultTabs, ...this.optionalTabs].map((tab) => {
      tab.selected = selectedTabs.some((tabInfo) => tabInfo.path === tab.path);
      return tab;
    });
  }

  async getSelectedTabs() {
    const { value } = await Preferences.get({ key: STORAGE_TABS_KEY });

    if (value) {
      return JSON.parse(value);
    } else {
      return this.defaultTabs;
    }
  }

  async setSelectedTabs(tabs: any[]) {
    await Preferences.set({ key: STORAGE_TABS_KEY, value: JSON.stringify(tabs) });
    this.tabsSubject.next(tabs);
  }
  getActiveTabs(){
    return this.tabsSubject.asObservable();
  }

  async loadSettings(){
    const tabs = await this.getSelectedTabs();
    this.tabsSubject.next(tabs);

  }


}
