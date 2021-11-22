import React, { useEffect, useRef, useState }  from 'react'

const KEYBOARD_KEY_BACKSPACE = 8
const KEYBOARD_KEY_DELETE = 46
const MASK_CHAR = "*"

export default ({ value, size, autoFocus, onChange, ...props }) => {
  
  const previousInput = useRef(null)
  const refs = useRef([])
  const [valueArray, setValueArray] = useState([])

  useEffect(() => { setValueArray(mapPropsToState()) }, [value])

  const mapPropsToState = () => Array(size).fill("").map((_, index) => (value || "")[index] || MASK_CHAR)
  const clamp = (val, min, max) => val > max ? max : val < min ? min : val
  const mapTransientArray = (cursor, valueString) => ([
    ...valueArray.slice(0, cursor),
    ...valueArray.slice(cursor, valueArray.length).map((_, index) => valueString[index] || valueArray[index + cursor])
  ])

  const handleChange = (position, event) => {
    var targetValue = event.target.value
    /* 
      When adding value it could come from paste and have 
      more than 1 char, so we need a mapper instead of 
      replace at index
    */
    if (targetValue) {
      var valueArrayNew = mapTransientArray(position, targetValue)
    } else {
      var valueArrayNew = [...valueArray]
      valueArrayNew[position] = MASK_CHAR
    }

    if (targetValue.length > 0) setCursorForward(position)

    setValueArray(valueArrayNew)
    onChange(valuesArrayToString(valueArrayNew), { valid: valueArrayNew.findIndex((char) => char === MASK_CHAR) < 0 })
  }

  const valuesArrayToString = (value) => value.join("")
  const setCursorForward = (cursor) => {
    refs.current[clamp(cursor + 1, 0, size - 1)].focus()
    if (cursor + 1 < size) refs.current[clamp(cursor + 1, 0, size - 1)].select()
  }

  const setCursorBackward = (cursor) => {
    refs.current[clamp(cursor - 1, 0, size - 1)].focus()
    refs.current[clamp(cursor - 1, 0, size - 1)].select()
  }

  const handleFocus = (event) => event.target.select()
  const handleKeyDown = (index) => previousInput.current = valueArray[index]

  /* 
    When `onKeyUp` event is handled, `onChange` handler may have changed the focus because it fires before.
    So, we need to make a check in the previous cursor input with `inputWas` to avoid moving cursor backwards two times
  */
  const handleKeyUp = (index, event) => {
    var value = String.fromCharCode(event.which)
    
    if (previousInput.current === value) setCursorForward(index)
    if (previousInput.current === MASK_CHAR && isBackKey(event)) setCursorBackward(index)
  }

  const isBackKey = (event) => 
    KEYBOARD_KEY_BACKSPACE == (event.keyCode || event.charCode) || KEYBOARD_KEY_DELETE == (event.keyCode || event.charCode) 

  const charValue = (value) => value === MASK_CHAR ? "" : value
  const shouldAutoFocus = (index) => autoFocus && index === 0

  return (
    <div>
      {valueArray.map((valueItem, index) => (
        <input
          {...props}
          key={index}
          value={charValue(valueItem)}
          ref={(ref) => refs.current.push(ref)} 
          autoFocus={shouldAutoFocus(index)}
          onFocus={handleFocus} 
          onChange={(event) => handleChange(index, event)}
          onKeyUp={(event) => handleKeyUp(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          maxLength={1}
        />
      ))}
    </div>
  )

}
