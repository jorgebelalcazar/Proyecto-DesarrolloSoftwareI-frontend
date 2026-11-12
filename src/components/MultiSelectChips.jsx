import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";

/** Reusable MUI multiple select that renders checked options and selected chips. */
export default function MultiSelectChips({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Selecciona una o más opciones",
}) {
  const labelId = `${label.toLowerCase().replace(/\s+/g, "-")}-label`;

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
        displayEmpty
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Box component="span" sx={{ color: "text.secondary" }}>
              {placeholder}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((item) => (
                <Chip key={item} label={item} size="small" />
              ))}
            </Box>
          )
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
