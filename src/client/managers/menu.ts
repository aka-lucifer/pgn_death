import { Control } from "fivem-js";
import { Client } from "../client";
import { Menu } from "../models/menu/menu";
import { Submenu } from "../models/menu/submenu";
import { createUUID } from "../utils";

export class MenuManager {
    private client: Client;
    private menus: any[] = [];
    private components: any[] = [];
    private resources: string[] = [];
    private openedMenu: any;
    private hoveredIndex: number;
    private controlTick: number;

    constructor(client: Client) {
        this.client = client;
        this.hoveredIndex = 0;
    }

    public async IsAnyMenuOpen(): Promise<boolean> {
        if (this.openedMenu) {
            return true;
        }

        return false;
    }

    public async IsMenuOpen(menuHandle: string): Promise<boolean> {
        if (this.openedMenu.handle == menuHandle) {
            return true;
        }

        return false;
    }

    public async GetOpenedMenu(): Promise<string> {
        if (this.openedMenu) {
            return this.openedMenu.handle;
        }
    }

    public ClearMenu(menu: Menu | Submenu): void {
        const menuComponents = this.menus[menu.GetHandle].components;
        for (let a = 0; a < menuComponents.length; a++) {
            const menuHandle = menuComponents[a].handle;
            this.components.splice(menuHandle);
            const menuIndex = this.menus.findIndex(menuFound => menuFound.GetHandle == menu.GetHandle);
            if (menuIndex) {
                this.menus[menuIndex].components.splice(a);
            }
        }
    }

    private StopControls(): void {
        clearTick(this.controlTick);
    }

    public AddMenu(menuName: string, menuResource: string, menuPosition: string): string {
        const handle = createUUID();
        // this.resources.push(menuResource);

        this.menus.push({
            name: menuName,
            type: "menu",
            components: [],
            resource: menuResource,
            position: menuPosition,
            handle: handle
        })

        return handle;
    }

    public AddSubMenu(menuName: string, parentMenu: Menu): string {
        const handle = createUUID();

        this.menus.push({
            handle: handle,
            name: menuName,
            type: "submenu",
            components: [],
            parent: parentMenu,
            resource: parentMenu.resource,
            position: parentMenu.position
        })

        const menuIndex = this.menus.findIndex(foundMenu => foundMenu.handle == parentMenu.handle);
        if (this.menus[menuIndex]) {
            this.menus[menuIndex].components.push({
                handle: handle,
                name: menuName,
                parent: parentMenu,
                type: "submenu",
                resource: parentMenu.resource,
                position: parentMenu.position
            })
        }

        return handle;
    }

    public AddButton(buttonName: string, parentMenu: Menu | Submenu, buttonCallback: CallableFunction, parentResource: string): void {
        const handle = createUUID();

        this.components.push({
            handle: handle,
            name: buttonName,
            type: "button",
            callback: buttonCallback,
            resource: parentResource
        });
        
        const menuIndex = this.menus.findIndex(foundMenu => foundMenu.handle == parentMenu.GetHandle);

        this.menus[menuIndex].components.push({
            handle: handle,
            name: buttonName,
            type: "button"
        });
    }

    public AddList(listName: string, listContents: Record<number, any>, parentMenu: Menu | Submenu, listCallback: CallableFunction, parentResource: string): void {
        const handle = createUUID();

        this.components.push({
            handle: handle,
            name: listName,
            type: "list",
            callback: listCallback,
            list: listContents,
            listIndex: 0,
            resource: parentResource
        });
        
        const menuIndex = this.menus.findIndex(foundMenu => foundMenu.handle == parentMenu.GetHandle);

        this.menus[menuIndex].components.push({
            handle: handle,
            name: listName,
            type: "list",
            list: listContents,
            listIndex: 0
        });
    }

    public AddCheckbox(checkboxName: string, checkboxState: boolean, parentMenu: Menu | Submenu, checkboxCallback: CallableFunction, parentResource: string): string {
        const handle = createUUID();

        this.components.push({
            handle: handle,
            name: checkboxName,
            type: "checkbox",
            callback: checkboxCallback,
            state: checkboxState,
            resource: parentResource
        });
        
        const menuIndex = this.menus.findIndex(foundMenu => foundMenu.handle == parentMenu.GetHandle);

        if (menuIndex != -1) {
            this.menus[menuIndex].components.push({
                handle: handle,
                name: checkboxName,
                type: "checkbox",
                state: checkboxState
            });
        }

        return handle;
    }

    public UpdateState(checkboxHandle: string, newState: boolean): void {
        let componentIndex = this.components.findIndex(foundComponent => foundComponent.handle == checkboxHandle);
        if (componentIndex != -1) {
            this.components[componentIndex].state = newState;
        }

        this.menus.forEach(element => {
            componentIndex = element.components.findIndex(foundMenu => foundMenu.handle == checkboxHandle);
            if (componentIndex != -1) {
                element.components[componentIndex].state = newState;

                SendNuiMessage(JSON.stringify({
                    type: "set_checkbox_state",
                    data: {
                        id: checkboxHandle,
                        state: newState
                    }
                }))
                
                return;
            }
        })
    }

    public async Open(menuHandle: string): Promise<void> {
        const menuIndex = this.menus.findIndex(foundMenu => foundMenu.handle == menuHandle);
        const foundMenu = this.menus[menuIndex];
        if (foundMenu) {
            SendNuiMessage(JSON.stringify({
                type: "open_menu",
                data: {
                    position: foundMenu.position,
                    name: foundMenu.name,
                    components: foundMenu.components,
                    option: 0
                }
            }))
        }

        this.openedMenu = foundMenu;
        this.hoveredIndex = 0;
        if (this.controlTick == undefined) {
            this.controlTick = setTick(() => {
                if (this.openedMenu) {
                    if (IsControlJustPressed(0, Control.PhoneUp) || IsDisabledControlJustPressed(0, Control.PhoneUp)) {
                        this.Move("up");
                    } else if (IsControlJustPressed(0, Control.PhoneDown) || IsDisabledControlJustPressed(0, Control.PhoneDown)) {
                        this.Move("down");
                    } else if (IsControlJustPressed(0, Control.PhoneLeft) || IsDisabledControlJustPressed(0, Control.PhoneLeft)) {
                        this.Move("left");
                    } else if (IsControlJustPressed(0, Control.PhoneRight) || IsDisabledControlJustPressed(0, Control.PhoneRight)) {
                        this.Move("right");
                    } else if (IsControlJustPressed(0, Control.PhoneSelect) || IsDisabledControlJustPressed(0, Control.PhoneSelect)) {
                        this.Move("enter");
                    } else if (IsControlJustPressed(0, Control.PhoneCancel) || IsDisabledControlJustPressed(0, Control.PhoneCancel)) {
                        this.Move("backspace");
                    }
                }
            });
        }
    }

    public async Close(): Promise<void> {
        if (this.openedMenu) {
            SendNuiMessage(JSON.stringify({
                type: "close_menu"
            }))

            this.openedMenu = null;
            this.hoveredIndex = 0;

            if (this.controlTick != undefined) {
                clearTick(this.controlTick);
                this.controlTick = undefined;
            }
        }
    }

    public Move(direction: string): void {
        if (direction == "down") {
            let nextElement = this.hoveredIndex + 1;

            if (nextElement > this.openedMenu.components.length - 1) {
                nextElement = 0;
            }

            this.hoveredIndex = nextElement;
            SendNuiMessage(JSON.stringify({
                type: "set_menu_option",
                data: {
                    option: this.hoveredIndex
                }
            }));
        } else if (direction == "up") {
            let prevElement = this.hoveredIndex - 1;

            if (prevElement < 0) {
                prevElement = this.openedMenu.components.length - 1;
            }

            this.hoveredIndex = prevElement;
            SendNuiMessage(JSON.stringify({
                type: "set_menu_option",
                data: {
                    option: this.hoveredIndex
                }
            }));
        } else if (direction == "right") {
            const selectedComponent = this.openedMenu.components[this.hoveredIndex];
            if (selectedComponent) {
                if (selectedComponent.type == "list") {
                    const componentIndex = this.components.findIndex(newComponent => newComponent.handle == selectedComponent.handle);
                    const currComponent = this.components[componentIndex];
                    let nextElement = selectedComponent.listIndex + 1;

                    if (nextElement > selectedComponent.list.length - 1) {
                        nextElement = 0;
                    }

                    selectedComponent.listIndex = nextElement;
                    currComponent.listIndex = nextElement;

                    SendNuiMessage(JSON.stringify({
                        type: "set_list_item",
                        data: {
                            handle: selectedComponent.handle,
                            listIndex: nextElement
                        }
                    }))
                }
            }
        } else if (direction == "left") {
            const selectedComponent = this.openedMenu.components[this.hoveredIndex];
            if (selectedComponent) {
                if (selectedComponent.type == "list") {
                    const componentIndex = this.components.findIndex(newComponent => newComponent.handle == selectedComponent.handle);
                    const currComponent = this.components[componentIndex];
                    let nextElement = selectedComponent.listIndex - 1;

                    if (nextElement < 0) {
                        nextElement = selectedComponent.list.length - 1;
                    }

                    selectedComponent.listIndex = nextElement;
                    currComponent.listIndex = nextElement;

                    SendNuiMessage(JSON.stringify({
                        type: "set_list_item",
                        data: {
                            handle: selectedComponent.handle,
                            listIndex: nextElement
                        }
                    }))
                }
            }
        } else if (direction == "enter") {
            const selectedComponent = this.openedMenu.components[this.hoveredIndex];
            if (selectedComponent) {
                if (selectedComponent.type == "submenu") {
                    this.Open(selectedComponent.handle);
                } else {
                    const componentIndex = this.components.findIndex(newComponent => newComponent.handle == selectedComponent.handle);
                    const currComponent = this.components[componentIndex];
                    if (selectedComponent.type == "checkbox") {
                        const newState = !currComponent.state;
                        currComponent.state = newState;
                        selectedComponent.state = newState;
                        currComponent.callback(newState);

                        SendNuiMessage(JSON.stringify({
                            type: "set_checkbox_state",
                            data: {
                                id: selectedComponent.handle,
                                state: newState
                            }
                        }))
                    } else if (selectedComponent.type == "list") {
                        currComponent.callback(currComponent.listIndex, currComponent.list[currComponent.listIndex]);
                    } else if (selectedComponent.type == "button") {
                        currComponent.callback();
                    }
                }
            }
        } else if (direction == "backspace") {
            if (this.openedMenu) {
                if (!this.openedMenu.parent) {
                    this.Close();
                } else {
                    this.Open(this.openedMenu.parent.handle);
                }
            }
        }
    }
}