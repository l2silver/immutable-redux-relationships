// @flow
import {Map} from 'immutable'
import {handleActions} from 'redux-actions'
import actionNames from 'resource-action-types'
import handlers from './handlers'
import generateDefaultState from './generateDefaultState'
import {ONE, MANY} from './relationshipTypes'
type $relationshipDefinition = {
  name: string;
  type: number;
  relatedEntityName: string;
}

type $props = {
  name: string,
  defaultStateConfig?: Object,
	options?: Object,
  otherActions?: Object,
  locationPath?: string[],
  relationshipDefinitions: $relationshipDefinition[]
};

function getMapOfRelationshipDefaultValues(relationshipDefinitions){
  return relationshipDefinitions.reduce((finalResult, {name}) => {
    finalResult[name] = new Map()
    return finalResult
  }, {})
}

function getMapOfRelationshipTypes(relationshipDefinitions){
  return relationshipDefinitions.reduce((finalResult, {name, type})=>{
    finalResult[name] = type
    return finalResult
  }, {})
}

function getMapOfRelationships(relationshipDefinitions){
  return relationshipDefinitions.reduce((finalResult, {name, relatedEntityName})=>{
    if(!finalResult[relatedEntityName]){
      finalResult[relatedEntityName] = []
    }
    finalResult.push(name)
    return finalResult
  }, {})
}

export default function ({name, relationshipDefinitions, defaultStateConfig = {}, otherActions = {}}: $props) {
  const mapOfRelationshipDefaultValues = getMapOfRelationshipDefaultValues(relationshipDefinitions)
  const mapOfRelationshipTypes = getMapOfRelationshipTypes(relationshipDefinitions)
  const mapOfRelationships = getMapOfRelationships(relationshipDefinitions)
  const removeActions = Object.keys(mapOfRelationships).reduce((finalResult, relatedEntityName)=>{
    finalResult[actionNames.remove(relatedEntityName)] = handlers.remove(mapOfRelationshipTypes, mapOfRelationships, relatedEntityName)
    return finalResult
  }, {})
  return handleActions(
    {
      [actionNames.link(name)]: handlers.link(mapOfRelationshipTypes),
      [actionNames.unlink(name)]: handlers.unlink(mapOfRelationshipTypes),
      [actionNames.createRelationship(name)]: handlers.createRelationship(mapOfRelationshipTypes),
      [actionNames.indexRelationship(name)]: handlers.indexRelationship(mapOfRelationshipTypes),
      ...removeActions,
      ...otherActions
    },
    generateDefaultState({...mapOfRelationshipDefaultValues, ...defaultStateConfig}))
}