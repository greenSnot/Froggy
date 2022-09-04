import React from "react";

export const Context = React.createContext<{
  atomic_button_fns: { [name: string]: Function };
  atomic_dropdown_menu: { [id: string]: { [name: string]: any } };
}>({
  atomic_button_fns: {},
  atomic_dropdown_menu: {},
});
