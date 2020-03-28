import React, {Component} from 'react'
import PropTypes from 'prop-types'

const KEYBOARD_KEY_BACKSPACE = 8
const KEYBOARD_KEY_DELETE = 46

class Otp extends Component {

  constructor(props) {
    super(props)

    this.inputWas = null
    this.inputRefs = []
    this.state = {
      value: []
    }
  }

  componentDidMount() {
    var {value, size} = this.props

    this.setState({
      value: Array(size).fill("").map((_, index) => value[index] || "")
    })
  }

  clamp(val, min, max) {
    return val > max ? max : val < min ? min : val
  }

  mapTransientArray(cursor, valueString) {
    var {value} = this.state

    return [
      ...value.slice(0, cursor),
      ...value.slice(cursor, value.length).map((_, index) => {
        return valueString[index] || value[index + cursor]
      })
    ]
  }

  onChange(position, event) {
    var {onChange} = this.props
    var {value} = this.state
    var targetValue = event.target.value

    /* 
      When adding value it could come from paste and have 
      more than 1 char, so we need a mapper instead of 
      replace at index
    */
    if (targetValue) {
      var valueNew = this.mapTransientArray(position, targetValue)
    } else {
      var valueNew = this.state.value
      valueNew[position] = ""
    }

    if (targetValue.length > 0) {
        this.setCursorForward(position, targetValue.length)
    } else {
      if (value[position] === "") {
        this.setCursorBackward(position)
      }
    }

    this.setState({value: valueNew})

    onChange(this.valuesArrayToString(valueNew))
  }

  valuesArrayToString(value) {
    return value.join("")
  }

  setCursorForward(cursor, by) {
    var {size} = this.props

    by = by || 1

    this.inputRefs[this.clamp(cursor + by, 0, size - 1)].focus()
  }

  setCursorBackward(cursor) {
    var {size} = this.props

    this.inputRefs[this.clamp(cursor - 1, 0, size - 1)].focus()
  }

  onFocus(position, event) {
    event.target.select()
    
    this.setState({cursor: position})
  }

  onKeyDown(index, event) {
    this.inputWas = this.state.value[index]
  }

  /* 
    When `onKeyUp` event is handled, `onChange` handler may have changed the focus because it fires before.
    So, we need to make a check in the previous cursor input with `inputWas` to avoid moving cursor backwards two times
  */
  onKeyUp(index, event) {
    var value = String.fromCharCode(event.which)
    
    if (this.inputWas === value) {
      this.setCursorForward(index)
    }

    if (this.isBackKey(event) && this.inputWas === "") {
      this.setCursorBackward(index)
    }
  }

  isBackKey(event) {
    var key = event.keyCode || event.charCode
    
    return KEYBOARD_KEY_BACKSPACE == key || KEYBOARD_KEY_DELETE == key
  }

  render() {
    var {placeholder, type, pattern, required, autoFocus} = this.props

    return (
      <div className="otp">
        {this.state.value.map((value, index) => {
          return (
            <div key={index} className="otp__item">
              <input
                type={type}
                pattern={pattern}
                value={value}
                required={required}
                placeholder={placeholder}
                autoFocus={autoFocus && index == 0}
                onFocus={(event) => this.onFocus(index, event)} 
                onChange={(event) => this.onChange(index, event)}
                onKeyUp={(event) => this.onKeyUp(index, event)}
                onKeyDown={(event) => this.onKeyDown(index, event)}
                ref={(input) => this.inputRefs.push(input)} 
              />
            </div>
          )
        })}
      </div>
    )
  }

}

Otp.defaultProps = {
  type: "text",
  autoFocus: false,
  required: false
}

Otp.propTypes = {
  type: PropTypes.string,
  pattern: PropTypes.string,
  autoFocus: PropTypes.bool,
  required: PropTypes.bool
}

export default Otp
