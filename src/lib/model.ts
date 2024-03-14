import type Component from "./components";

export type Entity = number;
export type EntityComponents = Map<string, Component>; // key: component name
export type EntitiesArray = Array<EntityComponents>; // key: entity id
