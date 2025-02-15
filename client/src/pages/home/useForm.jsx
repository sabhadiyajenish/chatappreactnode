import React, { useState } from "react";

function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const reset = () => {
    setValues(initialValues);
  };

  return { values, handleChange, reset };
}
export default useForm;
