import { Frame } from '../../framework/Frame.js';
import { MainView } from './mainView.js';

export const App = new Frame() // create a new Frame, all virtual Elements will be added to it

App.useEvents("click", "keydown", "submit", "input") // REQUIRED

App.mount(document.getElementById('app'))

export const mainView = new MainView

App.addVElement(mainView.vElement);
