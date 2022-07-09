import React, { Component } from 'react';
import axios from 'axios';

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = {
            forecasts: [], loading: false,
            solutionResult: null,
            numbers: [3,6,25,50,75,100],
            target: 952,
            errMsgText: null
        };
    }

    componentDidMount() {
    }

    newTarget = (newTarget) => {
        this.setState({ target: newTarget })
    };

    numberChange = (id, val) => {
        const n = this.state.numbers
        n[id] = val;
        this.setState({ numbers: n });
    }

    handleSolve = async (event) => {
        let n = this.state.numbers;
        let t = this.state.target;
        let url = `http://localhost:55599/api/solve?n=${n[0]}&n=${n[1]}&n=${n[2]}&n=${n[3]}&n=${n[4]}&n=${n[5]}&n=${t}`
        try {
            event.preventDefault();
            this.setState({ loading: true, solutionResult: null });
            const resp = await axios.get(url);
            this.setState({ loading: false, solutionResult: resp.data });
        }
        catch (error) {
            this.setState({ errMsgText: `${error.code} : ${error.message} : ${url}` });
        }
    }

    handleSolveRandom = async (event) => {
        const url='http://localhost:55599/api/solve/random'
        try {
            event.preventDefault();
            this.setState({ loading: true, solutionResult: null, errMsgText: null });
            const resp = await axios.get(url);
            this.setState({ loading: false, solutionResult: resp.data });
            this.setState({ numbers: resp.data.Numbers, target: resp.data.Target });
        }
        catch (error) {
            this.setState({ errMsgText: `${error.code} : ${error.message} : ${url}` });
        }
    }

    render() {
        let isLoading = this.state.loading ? <span>Thinking about it...</span> : this.state.solutionResult ? 'Finished' : 'Waiting...';

        let errMsg = this.state.errMsgText ? <pre color="red">{this.state.errMsgText}</pre> : null;

        let result =
            <div>
                <h1 id="tabelLabel" >Countdown solver</h1>
                <hr />
                <NumberInput id={0} onChange={this.numberChange} value={this.state.numbers[0]} />
                <NumberInput id={1} onChange={this.numberChange} value={this.state.numbers[1]} />
                <NumberInput id={2} onChange={this.numberChange} value={this.state.numbers[2]} />
                <NumberInput id={3} onChange={this.numberChange} value={this.state.numbers[3]} />
                <NumberInput id={4} onChange={this.numberChange} value={this.state.numbers[4]} />
                <NumberInput id={5} onChange={this.numberChange} value={this.state.numbers[5]} />
                <p>Chosen numbers {this.state.numbers.map((n, index) => <b key={index}>{n},</b>)}</p>
                <FormSetTarget onSubmit={this.handleSolve} newTarget={this.newTarget} target={this.state.target} />
                <FormRandom onSubmit={this.handleSolveRandom} />
                <hr />
                <h1>{isLoading}</h1>
                {errMsg}
            </div>;

        if (this.state.solutionResult)
            result = <> {result}
                <Numbers solutionResult={this.state.solutionResult} />
                <Target solutionResult={this.state.solutionResult} />
                <Solutions solutionResult={this.state.solutionResult} />
            </>;
        return (result);
    }
}

const SolutionCalculations = (props) => (
    <div>
        {props.calcs.map((calc, index) => <div key={index}>{calc}<br /></div>)}
    </div>
);

const Solutions = (props) => {
    let numSols = props.solutionResult.NumSolutions;

    let result = <div><p>Number of solutions: {numSols}</p></div>;

    if (numSols > 0)
        result = <> {result} <SolutionCalculations calcs={props.solutionResult.Solutions[0].SeparateCalculations}/></>;

    return (result);
};

const Target = (props) => (
    <div>
        <h3>Target: {props.solutionResult.Target}</h3>
    </div>
);

const Numbers = (props) => (
    <div>
        <h3>Numbers: {props.solutionResult.Numbers.map((n, index) => <span key={index}>{ n },</span>)}</h3>
    </div>
);


class FormSetTarget extends Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit}>
                Target <input type="text" placeholder="Target" value={this.props.target}
                    onChange={event => this.props.newTarget(event.target.value)} required />
                <button>Go</button>
            </form>
        )
    }
};

class FormRandom extends Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit}>
                <button>Random selection</button>
            </form>
        )
    }
};

class Form extends Component {
    state = { target: 101 };
    handleSubmit = async (event) => {
        event.preventDefault();
        const resp = await axios.get('http://localhost:55599/api/solve/random');
        this.props.onSubmit(resp.data)
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                Target <input type="text" placeholder="Target" value={this.state.target}
                    onChange={event => this.setState({target: event.target.value})} required />
                <button>Go</button>
            </form>
        )
    }
};

class NumberInput extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <input type="number" id={this.props.id} value={this.props.value}
                /*                onChange={event => this.handleChange(event, this.props.id)}*/
                onChange={event => this.props.onChange(this.props.id, event.target.value)}
            />
        )
    }
}
