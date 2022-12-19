import './App.css';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    const listItems = [];
    for (const jsonModel of Object.values(window.localStorage)) {
      try {
        const model = JSON.parse(jsonModel);
        if (model.title !== undefined) {
          listItems.push(model);
        }
      } catch (e) {
        // skip without error
      }
    }

    this.sortListItems(listItems);

    this.state = {
      listItems: listItems,
      newItem: "",
    }
  }

  sortListItems(listItems) {
    return listItems.sort((a, b) => b.score - a.score);
  }
  
  addElement = (e) => {
    e.preventDefault();
    const newItemObject = {
      title: this.state.newItem,
      score: 0,
    }
    window.localStorage.setItem(this.state.newItem, JSON.stringify(newItemObject));
    this.setState(prevState => ({
      listItems: [...prevState.listItems, newItemObject],
      newItem: "",
    }));
  };

  handleNewItemChange = (event) => {
    this.setState({newItem: event.currentTarget.value});
  }

  handlePlus = (event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.slice();
      const newItem = {
        title: newListItems[index].title,
        score: newListItems[index].score + 1,
      }
      newListItems[index] = newItem;
      this.sortListItems(newListItems);

      window.localStorage.setItem(newItem.title, JSON.stringify(newItem));

      return {
        listItems: newListItems,
      }
    })
  }

  render() {
    const listTemplate =
      this.state.listItems.map((element, key) => {
        return <li key={key}>
          <div className='elementTitle'>{element.title}</div>
          <div className='score'>{element.score}</div>
          <div className='plusButton'><button onClick={(e) => this.handlePlus(e, key)}>+</button></div>
        </li>
      });

    return (
      <div className="App">
        <header className="App-header">
          <ol>
            {listTemplate}
          </ol>
          <form onSubmit={this.addElement}>
            <input type="text" name="element" value={this.state.newItem} onChange={this.handleNewItemChange}/>
          </form>
        </header>
      </div>
    );
  }
}

export default App;
