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
      flag: false,
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

  handleMinus = (event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.slice();
      const newItem = {
        title: newListItems[index].title,
        score: newListItems[index].score - 1,
      }
      newListItems[index] = newItem;
      this.sortListItems(newListItems);

      window.localStorage.setItem(newItem.title, JSON.stringify(newItem));

      return {
        listItems: newListItems,
      }
    })
  }

  handleDelete = (event, index) => {
    this.setState(prevState => {
      const deletedTitle = prevState.listItems[index].title;
      const newListItems = prevState.listItems.toSpliced(index, 1);

      window.localStorage.removeItem(deletedTitle);

      return {
        listItems: newListItems,
      }
    })
  }

  handleFlag = (event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.slice();
      const newItem = {
        title: newListItems[index].title,
        score: newListItems[index].score,
        flag: !newListItems[index].flag,
      }
      newListItems[index] = newItem;

      window.localStorage.setItem(newItem.title, JSON.stringify(newItem));

      return {
        listItems: newListItems,
      }
    })
  }

  handleExport = (event) => {
    const blob = new Blob([JSON.stringify(this.state.listItems)], { type: 'text/json' });
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = `scoringlist-export-${Date.now()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  handleImport = (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContents = event.target.result;
        const listItems = JSON.parse(fileContents);
        this.setState(() => {
          return {
            listItems: listItems
          }
        });
        window.localStorage.clear();
        for (const listItem of listItems) {
          window.localStorage.setItem(listItem.title, JSON.stringify(listItem));
        }
      };

      reader.readAsText(file);
    }
    fileInput.value = '';
  }

  render() {
    const listTemplate =
      this.state.listItems.map((element, key) => {
        return <li key={key} className={element.flag ? 'flag' : ''}>
          <div className='elementTitle'>{element.title}</div>
          <div className='score'>{element.score}</div>
          <div className='plusButton'><button onClick={(e) => this.handlePlus(e, key)}>+</button></div>
          <div className='minusButton'><button onClick={(e) => this.handleMinus(e, key)}>-</button></div>
          <div className='deleteButton'><button onClick={(e) => this.handleDelete(e, key)}>🗑️</button></div>
          <div className='flagButton'><button onClick={(e) => this.handleFlag(e, key)}>🚩</button></div>
        </li>
      });

    return (
      <div className="App">
          <ol>
            {listTemplate}
          </ol>
          <form onSubmit={this.addElement}>
            <div className='inputNew'>
              <input type="text" name="element" value={this.state.newItem} onChange={this.handleNewItemChange}/>
            </div>
          </form>
          <p>
            <div className='export'>
              <button onClick={(e) => this.handleExport(e)}>export</button>
              <form id="upload">
                <input type="file" id="fileInput" name="file"/>
                <button onClick={(e) => this.handleImport(e)}>import</button>
              </form>
            </div>
          </p>
      </div>
    );
  }
}

export default App;
