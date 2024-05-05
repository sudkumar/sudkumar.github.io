import { Sandpack, type SandpackProps } from "@codesandbox/sandpack-react";

export function Problem() {
  return (
    <BasicSetup
      files={{
        "App.js": {
          code: `import { Form, Field, FieldArray } from './Form';
import HotelRates from "./HotelRates"

export default function App() {
  return <Form 
    initialValues={{ hotels: initialValues }}>
    <FieldArray name="hotels">
      {({ fields }) => <>
        {fields.map((fieldName, index) => (
          <div key={index}>
            <label>Name</label>:&nbsp;
            <Field name={fieldName + ".name"} type="text" component="input" />
            <HotelRates name={fieldName + ".name"} />&nbsp;
            <button type="button" onClick={() => fields.remove(index)}>&times;</button><br /><br />
          </div>
        ))}
        <button type="button" onClick={() => fields.push({ name: ""})}>Add More</button>
      </>}
    </FieldArray>
    <br />
    <p style={{ color: "red"}}>Problem: Removal of an item (e.g. 2nd) will refetch to rates of all following items (e.g. 3rd,4th...)</p>
  </Form>
}

const initialValues = [
  { name: "Hotel 1"}, 
  { name: "Hotel 2"}, 
  { name: "Hotel 3"}
]`,
        },
      }}
    />
  );
}

export function Solution() {
  return (
    <BasicSetup
      files={{
        "App.js": `import { Form, Field, FieldArray, getIn, generateId } from './Form';
import HotelRates from "./HotelRates"

export default function App() {
  return <Form 
    initialValues={{ hotels: initialValues }}>
    {({ form }) => <><FieldArray name="hotels">
      {({ fields }) => <>
        {fields.map((fieldName, index) => (
          <div key={getIn(form.getState().values, fieldName + ".__id")}>
            <label>Name</label>:&nbsp;
            <Field name={fieldName + ".name"} type="text" component="input" />
            <HotelRates keyValue={getIn(form.getState().values, fieldName + ".__id")} name={fieldName + ".name"} />&nbsp;
            <button type="button" onClick={() => fields.remove(index)}>&times;</button><br /><br />
          </div>
        ))}
        <button type="button" onClick={() => fields.push({ __id: generateId(), name: ""})}>Add More</button>
      </>}
    </FieldArray>
    <br />
    <p style={{ color: "green"}}>Removal of an item (e.g. 2nd) will <b>NOT</b> refetch to rates of all following items (e.g. 3rd,4th...)</p>
    </>}
  </Form>
}

const initialValues = [
  { __id: generateId(), name: "Hotel 1"}, 
  { __id: generateId(), name: "Hotel 2"}, 
  { __id: generateId(), name: "Hotel 3"}
]`,
      }}
    />
  );
}

function BasicSetup(props: SandpackProps) {
  return (
    <Sandpack
      template="react"
      theme="dark"
      options={{
        editorHeight: 400,
      }}
      customSetup={{
        dependencies: {
          "final-form": "^4",
          "react-final-form": "^6",
          "final-form-arrays": "^3",
          "react-final-form-arrays": "^3",
        },
      }}
      files={{
        ...props.files,
        "HotelRates.js": hotelRatesJs,
        "Form.js": formJs,
      }}
    />
  );
}

const hotelRatesJs = `import { useField, useForm } from 'react-final-form'
import { useState, useEffect } from 'react'
import { getIn } from "final-form"

export default function HotelRates({ name, keyValue }) {
  const form = useForm()
  const { input: { value } } = useField(name, { subscription: { value: true }})
  console.log({ 
    name, 
    value, 
    x: JSON.stringify(form.getFieldState("hotels")?.value || {}), 
    y: JSON.stringify(getIn(form.getState().values, "hotels") || {}),
    valueFromFormState: getIn(form.getState().values, name),
    valueFromFieldState: form.getFieldState(name)?.value,
  })
  const [rate, loadingState] = useRate(value)
  if (!value) return null
  return <mark>Rate: {loadingState === "idle" ? "?" : loadingState === "loading" ? "..." : rate}</mark>
}

function useRate(name) {
  const [rate, setRate] = useState('')
  const [loadingState, setLoadingState] = useState('idle')
  useEffect(() => {
    const control = new AbortController()
    const timeout = setTimeout(() => {
      if (!name.trim().length) {
         setRate('')
         return
      }
      setLoadingState('loading') 
      setTimeout(() => {
        if (control.signal.aborted) return
        setRate(Number(Math.random() * 1000).toFixed(2))
        setLoadingState('loaded')
      }, Math.floor(Math.random() / 2 * 1000))
    }, 1000)
    return () => {
      clearTimeout(timeout)
      control.abort()
      setLoadingState('idle')
    }
  }, [name])
  return [rate, loadingState]
}`;

const formJs = `import { Form as ReactFinalForm, Field } from 'react-final-form'
  import { FieldArray as ReactFinalFormFieldArray } from 'react-final-form-arrays'
  import arrayMutators from 'final-form-arrays'
  import { getIn } from "final-form"

  export function Form ({ children, mutators, ...props}) {
    return <ReactFinalForm 
      mutators={{ ...arrayMutators, ...mutators }}
      onSubmit={() => undefined}
      subscription={{}} 
      {...props}>
      {({ handleSubmit, ...props }) => (
        <form onSubmit={handleSubmit}>
          {typeof children === "function" ? children(props) : <>{children}</>}
        </form>
      )}
    </ReactFinalForm>
  }

  export function FieldArray(props) {
    return <ReactFinalFormFieldArray subscription={{}} {...props}  />
  }

  export function generateId() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    )
  }

  export { Field, getIn }`;
