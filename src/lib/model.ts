import Component from "./components";

export type Entity = string;
export type EntityComponents = Map<string, Component>; // key: component name
export type EntitiesMap = Map<Entity, EntityComponents>; // key: entity id
