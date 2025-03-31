import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    const listItems = this.getDataFromLocalStorage();

    this.sortListItems(listItems);

    this.state = {
      listItems: listItems,
      newItem: "",
      lastUpdated: null,
    }
  }

  getDataFromLocalStorage() {
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

    return listItems;
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
      lastUpdated: newItemObject.title,
    }));
  };

  handleNewItemChange = (event) => {
    this.setState({newItem: event.currentTarget.value});
  }

  handlePlus = (_event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, score: item.score + 1 };
        } else {
          return item;
        }
      });
      this.sortListItems(newListItems);

      window.localStorage.setItem(newListItems[index].title, JSON.stringify(newListItems[index]));

      return {
        listItems: newListItems,
        lastUpdated: prevState.listItems[index].title,
      };
    });
  }

  handleMinus = (_event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, score: item.score - 1 };
        } else {
          return item;
        }
      });
      this.sortListItems(newListItems);

      window.localStorage.setItem(newListItems[index].title, JSON.stringify(newListItems[index]));

      return {
        listItems: newListItems,
        lastUpdated: prevState.listItems[index].title,
      };
    });
  }

  handleDelete = (_event, index) => {
    this.setState(prevState => {
      const deletedTitle = prevState.listItems[index].title;
      const newListItems = prevState.listItems.toSpliced(index, 1);

      window.localStorage.removeItem(deletedTitle);

      return {
        listItems: newListItems,
        lastUpdated: null,
      }
    })
  }

  handleFlag = (_event, index) => {
    this.setState(prevState => {
      const newListItems = prevState.listItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, flag: !item.flag };
        } else {
          return item;
        }
      });

      window.localStorage.setItem(newListItems[index].title, JSON.stringify(newListItems[index]));

      return {
        listItems: newListItems,
        lastUpdated: newListItems[index].title,
      };
    });
  }

  handleExport = (_event) => {
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

  getClassNames(element) {
    const classNames = [];
    if (element.flag) classNames.push('flag');
    if (this.state.lastUpdated === element.title) classNames.push('last-updated');
    return classNames.join(' ');
  }

  render() {

    return (
      <div className="App">
          <ol>
            {this.listTemplate()}
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

  listTemplate() {
    return this.state.listItems.map((element, key) => {
      return (
        <li key={key} className={this.getClassNames(element)}>
          <div className='elementTitle'>{element.title}</div>
          <div className='score'>{element.score}</div>
          <div className='plusButton'><button onClick={(e) => this.handlePlus(e, key)}>+</button></div>
          <div className='minusButton'><button onClick={(e) => this.handleMinus(e, key)}>-</button></div>
          <div className='deleteButton'><button onClick={(e) => this.handleDelete(e, key)}>🗑️</button></div>
          <div className='flagButton'><button onClick={(e) => this.handleFlag(e, key)}>🚩</button></div>
        </li>
      );
    });
  }
}

export default App;
