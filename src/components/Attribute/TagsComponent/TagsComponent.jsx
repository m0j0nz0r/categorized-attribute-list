import React from 'react';
import t from 'tcomb-form';
import ReactListInput from 'react-list-input';

const Input = ({ value, onChange, type }) => <input className="form-control" type={type} value={value} onChange={e => onChange(e.target.value)} />;
class TagsComponent extends t.form.Component {
    /**
     * Builds the JSX for each item in the component's value list.
     *
     * @param {function} decorateHandle - Returns the passed argument in a wrapper.
     * @param {boolean} removable - Enables/disables the remove button for this item.
     * @param {function} onChange - Called when the item value is changed.
     * @param {function} onRemove - Called when the item is removed from the list.
     * @param {string} value - String value of the item.
     * @returns {XML} - Item element JSX markup.
     * @constructor
     */
  static Item({ decorateHandle, removable, onChange, onRemove, value }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {decorateHandle(<span className="material-icons" style={{ cursor: 'move' }}>swap_vert</span>)}
        <button
          className="material-icons"
          onClick={removable ? onRemove : x => x}
          style={{
            cursor: removable ? 'pointer' : 'not-allowed',
            color: removable ? '#666' : 'gray',
          }}
        >close</button>
        <Input className="form-control" value={value} onChange={onChange} />
      </div>
    );
  }

    /**
     * Builds the JSX for the input box and add button for the component.
     *
     * @param {string} value - Value on the input field.
     * @param {function} onAdd - Called when item is added to the list.
     * @param {boolean} canAdd - Is adding allowed.
     * @param {function} add - Used to add elements to the list.
     * @param {function} onChange - Called when the value of the input is changed.
     * @returns {XML} - JSX Markup for the input of the component.
     * @constructor
     */
  static StagingItem({ value, onAdd, canAdd, add, onChange }) {
    return (
      <div className="form-group" style={{ display: 'flex' }}>
        <Input
          className="form-control"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={canAdd ? onAdd : undefined}
          className="btn btn-primary"
        >Add</button>
      </div>
    );
  }

    /**
     * Returns the template factory for tcomb-forms to display the component.
     *
     * @returns {function(*)} - The get template function for the factory.
     */
  getTemplate() {
    return locals =>
      (<div className="list-input">
        <ReactListInput
          initialStagingValue=""
          onChange={locals.onChange}
          ItemComponent={TagsComponent.Item}
          StagingComponent={TagsComponent.StagingItem}
          value={locals.value}
        />
      </div>);
  }

}

export default TagsComponent;
