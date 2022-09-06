import React from "react";
import { DragData } from "./types";

export const Context = React.createContext<{
  atomic_button_fns: { [name: string]: Function };
  atomic_dropdown_menu: { [id: string]: { [name: string]: any } };
  brick_on_drag_start: (e: DragData) => void;
  brick_on_context_menu: (e: DragData) => void;
}>({
  atomic_button_fns: {},
  atomic_dropdown_menu: {},
  brick_on_drag_start: (e: DragData) => {},
  brick_on_context_menu: (e: DragData) => {},
});
