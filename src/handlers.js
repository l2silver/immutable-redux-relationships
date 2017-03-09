// @flow
import {OrderedSet, Map, Record} from 'immutable'
import {MANY, ONE} from './relationshipTypes'
type $modelGenerator = (ent: Object)=>Class<any>
type $location = string[];
export default {
  link(mapOfRelationshipTypes: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = mapOfRelationshipTypes[relationshipName]
      if (relationshipType === MANY){
        return state.updateIn([relationshipName, `${id}`], (ids: any) => {
          if(ids){
            return ids.add(relationshipValue)
          }
          return new OrderedSet([relationshipValue])
        })
      }
      return state.setIn([relationshipName, `${id}`], relationshipValue)
    }
  },
  createRelationship(mapOfRelationshipTypes: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = mapOfRelationshipTypes[relationshipName]
      if (relationshipType === MANY){
        return state.setIn([relationshipName, `${id}`], new OrderedSet([relationshipValue]))
      }
      return state.setIn([relationshipName, `${id}`], relationshipValue)
    }
  },
  
  unlink(mapOfRelationshipTypes: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, id, relationshipValue} = payload.relationship
      const relationshipType = mapOfRelationshipTypes[relationshipName]
      if (relationshipType === MANY){
        return state.updateIn([relationshipName, `${id}`], (ids: any) => {
          if(ids){
            return ids.remove(relationshipValue)
          }
          return new OrderedSet()
        })
      }
      return state.setIn([relationshipName, `${id}`], 0)
    }
  },

  indexRelationship(mapOfRelationshipTypes: Object) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {relationshipName, idValuePairs} = payload.relationships
      const relationshipType = mapOfRelationshipTypes[relationshipName]
      return state.updateIn([relationshipName], relationships=>{
        idValuePairs.reduce((finalResult, {id, value})=>{
          const finalValue = relationshipType === MANY ? new OrderedSet(value) : value
          finalResult.set(`id`, finalValue)
          return finalResult
        }, relationships)
      })
    }
  },
  remove(mapOfRelationshipTypes: Object, mapOfRelationships: Object, entityName: string) {
    return function (state: Map<string, any>, {payload, error}: Object) {
      if (error) {
        return state
      }
      const {id} = payload
      const relationshipNames = mapOfRelationships[entityName]
      return relationshipNames.reduce((finalResult, relationshipName)=>{
        const relationshipType = mapOfRelationshipTypes[relationshipName]
        if (relationshipType === MANY){
          return finalResult.updateIn([relationshipName], (mapOfIds: Map<string, OrderedSet<number | string>>) => {
            return mapOfIds.map(ids=>ids && ids.delete(id))
          })
        }
        return finalResult.updateIn([relationshipName], (mapOfIds: Map<string, OrderedSet<number | string>>) => {
          return mapOfIds.map(idValue=>idValue === id ? 0 : idValue)
        })
      }, state)
    }
  },
}
